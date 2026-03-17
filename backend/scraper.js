const { getDb, saveDb } = require("./database");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { fetchTrendingFinance, fetchAutomotiveNews, fetchMoviesNews, fetchMusicNews } = require("./scraper-extensions");

const USER_AGENT =
  "WikiTrendingScraper/3.0 (https://github.com/scraper; contact@example.com)";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function categorizeArticlesBatch(articles) {
  if (!process.env.GEMINI_API_KEY) {
    return articles.map((a) => ({ ...a, category: "#General" }));
  }

  const titles = articles.map((a) => a.article.replace(/_/g, " "));
  const prompt = `Categorize the following Wikipedia article titles into ONE of the following strict tags ONLY: 
#Geopolitics, #TradeAndTariffs, #SecurityAndTerrorism, #GlobalTourism, #Entertainment, #Science, #Corporate, #Automotive, #Movies, #Music, #General.
Return ONLY a valid JSON array of strings in the exact same order as the input list.

Titles:
${JSON.stringify(titles)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text || "[]";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const categories = JSON.parse(rawText);
    
    if (Array.isArray(categories) && categories.length === articles.length) {
      return articles.map((a, i) => ({ ...a, category: categories[i] }));
    }
    throw new Error("Category array length mismatch");
  } catch (error) {
    console.error("[Agent] AI Categorization failed. Falling back to #General.", error.message);
    return articles.map((a) => ({ ...a, category: "#General" }));
  }
}

async function fetchTrendingArticles() {
  try {
    const db = await getDb();

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const year = yesterday.getUTCFullYear();
    const month = String(yesterday.getUTCMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getUTCDate()).padStart(2, "0");

    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${month}/${day}`;

    console.log(`[Scraper] Fetching: ${url}`);

    const response = await fetch(url, {
      headers: { "Api-User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    const articles = data.items[0].articles.slice(0, 50);

    const timestamp = new Date().toISOString();
    const windowStart = new Date(
      Math.floor(now.getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000)
    ).toISOString();

    const existing = db.exec(
      "SELECT COUNT(*) as count FROM trending_articles WHERE timestamp >= ?",
      [windowStart]
    );

    if (existing.length > 0 && existing[0].values[0][0] > 0) {
      console.log(`[Scraper] Data already exists for this 30-min window, skipping.`);
      return;
    }

    console.log(`[Agent] Prompting LLM to categorize ${articles.length} viral posts into specific Intelligence subsets...`);
    const categorizedArticles = await categorizeArticlesBatch(articles);

    console.log(`[Scraper] Enriching articles with Wikipedia high-res pageimages...`);
    let enrichedArticles = await enrichArticles(categorizedArticles);

    // Fetch from External Advanced Sources
    console.log(`[Scraper] Merging External Sources (Yahoo Finance, RSS)...`);
    const mixinData = await Promise.all([
      fetchTrendingFinance(),
      fetchAutomotiveNews(),
      fetchMoviesNews(),
      fetchMusicNews()
    ]);

    // Flatten external results
    const externalArticles = mixinData.flat().map((item, index) => {
        return {
            ...item,
            rank: enrichedArticles.length + index + 1, // Append to bottom of global rankings
            article_url: `https://www.google.com/search?q=${encodeURIComponent(item.article)}` // Search fallback
        };
    });

    // Merge both arrays
    enrichedArticles = [...enrichedArticles, ...externalArticles];

    const stmt = db.prepare(`
      INSERT INTO trending_articles (title, views, rank, timestamp, article_url, thumbnail_url, originalimage_url, description, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < enrichedArticles.length; i++) {
      const item = enrichedArticles[i];
      const title = item.article || item.title;
      // external sources already have spaces in title, genericize
      const cleanTitle = typeof title === 'string' ? title.replace(/_/g, " ") : "Trending";
      const articleUrl = item.article_url || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;

      stmt.run([
        cleanTitle,
        item.views,
        i + 1,
        timestamp,
        articleUrl,
        item.thumbnail || null,
        item.originalimage || null,
        item.description || null,
        item.category || '#General'
      ]);
    }

    stmt.free();
    saveDb();

    console.log(
      `[Scraper] Successfully stored ${enrichedArticles.length} combined multi-source articles at ${timestamp}`
    );
  } catch (error) {
    console.error(`[Scraper] Error: ${error.message}`);
  }
}

async function enrichArticles(articles) {
  const enriched = [];
  const batchSize = 10;

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    
    // First, get descriptions via summary API
    const promises = batch.map(async (article) => {
      try {
        if (article.article.startsWith("Special:") || article.article === "Main_Page") {
          return { ...article, thumbnail: null, originalimage: null, description: null };
        }

        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article.article)}`;
        const res = await fetch(summaryUrl, { headers: { "Api-User-Agent": USER_AGENT } });
        
        let desc = null;
        let thumbUrl = null;
        let originalUrl = null;

        if (res.ok) {
          const summary = await res.json();
          desc = summary.extract ? summary.extract.substring(0, 200) : null;
          thumbUrl = summary.thumbnail?.source || null;
        }

        // Now, strictly get the high-res original image using the action=query API
        // This bypassed the crop constraints of the summary endpoint.
        const queryUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(article.article)}&prop=pageimages&piprop=original&format=json`;
        const qRes = await fetch(queryUrl, { headers: { "Api-User-Agent": USER_AGENT } });
        
        if (qRes.ok) {
           const qData = await qRes.json();
           const pages = qData.query?.pages;
           if (pages) {
             const pageId = Object.keys(pages)[0];
             if (pageId && pages[pageId].original && pages[pageId].original.source) {
                 originalUrl = pages[pageId].original.source;
             }
           }
        }

        return {
          ...article,
          thumbnail: thumbUrl,
          originalimage: originalUrl || thumbUrl,
          description: desc,
        };
      } catch (err) {
        return { ...article, thumbnail: null, originalimage: null, description: null };
      }
    });

    const results = await Promise.all(promises);
    enriched.push(...results);

    if (i + batchSize < articles.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return enriched;
}

module.exports = { fetchTrendingArticles };
