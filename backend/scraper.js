const { getDb, saveDb } = require("./database");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { fetchTrendingFinance, fetchAutomotiveNews, fetchMoviesNews, fetchMusicNews } = require("./scraper-extensions");

const USER_AGENT =
  "WikiTrendingScraper/3.0 (https://github.com/scraper; contact@example.com)";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CATEGORIES = [
  "#Geopolitics", 
  "#TradeAndTariffs", 
  "#SecurityAndTerrorism", 
  "#GlobalTourism", 
  "#Science", 
  "#Entertainment",
  "#General"
];

async function categorizeArticlesBatch(articles) {
  const SCIENCE_KW = ["space", "nasa", "physics", "biology", "chemistry", "quantum", "moon", "mars", "satellite", "telescope", "health", "disease", "vaccine", "syndrome", "species", "dinosaur", "fossil"];
  const TERROR_KW = ["war", "attack", "military", "army", "navy", "force", "troop", "weapon", "missile", "cartel", "police", "crime", "murder", "cartel", "cyber", "hack"];
  const GEO_KW = ["election", "president", "minister", "parliament", "treaty", "united nations", "summit", "diplomacy", "border", "refugee", "democrat", "republican", "voting", "campaign"];
  const TRADE_KW = ["economy", "inflation", "tariff", "export", "import", "gdp", "market", "bank", "currency", "trade", "sanction", "debt", "recession", "company", "biz"];
  const TOURISM_KW = ["city", "country", "river", "mountain", "island", "museum", "park", "monument", "hotel", "resort", "airline", "flight", "tourism", "destination"];
  const ENTERTAINMENT_KW = ["actor", "actress", "film", "movie", "singer", "band", "album", "song", "award", "oscar", "grammy", "celebrity", "star", "wrestler", "athlete", "nba", "nfl", "football", "soccer", "marvel", "dc", "anime"];

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Analyze the following Wikipedia titles and categorize them into ONE of these exact categories:
      ${CATEGORIES.join(", ")}
      
      STRICT RULES:
      1. If the topic is a person (Actor, Celebrity, Athlete, Artist like "Banksy"), it CANNOT be #Science, #TradeAndTariffs, or #Geopolitics. Assign it to #Entertainment or #General.
      2. #TradeAndTariffs MUST strictly be about economics, taxes, imports/exports, companies, or trade deals.
      3. If confidence is below 90% that it fits a specific category, assign it to #General.
      
      Return a valid JSON object mapping the titles to their categories. Example: { "Banksy": "#Entertainment", "Quantum computing": "#Science" }
      
      Titles:
      ${articles.map(a => a.article.replace(/_/g, " ")).join(" | ")}`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
      
      let text = response.text;
      if (text.startsWith("\`\`\`json")) text = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      else if (text.startsWith("\`\`\`")) text = text.replace(/\`\`\`/g, "").trim();
      
      const catMap = JSON.parse(text);

      return articles.map(a => {
          const title = a.article.replace(/_/g, " ");
          let assigned = catMap[title] || "#General";
          if (!CATEGORIES.includes(assigned)) assigned = "#General";
          return { ...a, category: assigned };
      });
    } catch (err) {
      console.error("[Scraper] Gemini Validation Failed, falling back to Deterministic Keywords:", err.message);
    }
  }

  // Fallback / Deterministic Regex
  return articles.map(a => {
    const title = a.article.toLowerCase().replace(/_/g, " ");
    let assigned = "#General";

    const hasMatch = (keywords) => keywords.some(kw => title.includes(kw));

    if (hasMatch(ENTERTAINMENT_KW)) assigned = "#Entertainment";
    else if (hasMatch(SCIENCE_KW)) assigned = "#Science";
    else if (hasMatch(TERROR_KW)) assigned = "#SecurityAndTerrorism";
    else if (hasMatch(GEO_KW)) assigned = "#Geopolitics";
    else if (hasMatch(TRADE_KW)) assigned = "#TradeAndTariffs";
    else if (hasMatch(TOURISM_KW)) assigned = "#GlobalTourism";

    if (assigned === "#General" && title.split(" ").length <= 3 && !title.includes("of") && !title.includes("the")) {
       assigned = "#Entertainment"; // Err on entertainment for distinct names
    }

    return { ...a, category: assigned };
  });
}

async function enrichArticles(articles) {
  const BATCH_SIZE = 25; // API usually allows 50, but let's be safe
  const enrichedArticles = [];

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const titles = batch.map((a) => encodeURIComponent(a.article)).join("|");

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&piprop=original|thumbnail&pithumbsize=800&exintro=1&explaintext=1&titles=${titles}&format=json`,
        { headers: { "Api-User-Agent": USER_AGENT } }
      );
      
      if (!response.ok) throw new Error("Wikimedia API Error");
      
      const data = await response.json();
      const pages = data.query?.pages || {};

      const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

      for (const article of batch) {
        const titleClean = article.article.replace(/_/g, " ");
        const page = Object.values(pages).find(
          (p) => p.title.replace(/ /g, "_") === article.article || p.title === titleClean
        );
        
        let finalImageUrl = page?.original?.source || page?.thumbnail?.source;

        // Stage 2: Unsplash fallback
        if (!finalImageUrl && UNSPLASH_KEY) {
           try {
             const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(titleClean)}&client_id=${UNSPLASH_KEY}&per_page=1`);
             const unsplashData = await unsplashRes.json();
             if (unsplashData.results && unsplashData.results.length > 0) {
                finalImageUrl = unsplashData.results[0].urls.regular;
             }
           } catch (err) {
             console.warn(`[Scraper] Unsplash failed for ${titleClean}`);
           }
        }

        // Stage 3: Pollinations AI Fallback
        if (!finalImageUrl) {
           finalImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(titleClean + " " + article.category + " high quality photo bloomberg magazine")}?width=800&height=800&nologo=true`;
        }

        enrichedArticles.push({
          ...article,
          originalimage: finalImageUrl,
          thumbnail: finalImageUrl,
          description: page?.extract ? page.extract.substring(0, 200) + "..." : null,
        });
      }
    } catch (err) {
      console.warn(`[Scraper] Failed to enrich batch: ${err.message}`);
      enrichedArticles.push(...batch);
    }
  }

  return enrichedArticles;
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
    // VAST CONTENT: Fetch 250 items instead of 50 to survive strict LLM filtering
    const articles = data.items[0].articles.filter(a => a.article !== "Main_Page" && !a.article.includes("Special:")).slice(0, 250);

    const timestamp = new Date().toISOString();

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

    for (let i = 0; i < enrichedArticles.length; i++) {
      const item = enrichedArticles[i];
      const title = item.article || item.title;
      // external sources already have spaces in title, genericize
      const cleanTitle = typeof title === 'string' ? title.replace(/_/g, " ") : "Trending";
      const articleUrl = item.article_url || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;

      // Check if article exists
      const existingQuery = db.exec("SELECT id FROM trending_articles WHERE title = ?", [cleanTitle]);
      
      if (existingQuery.length > 0 && existingQuery[0].values.length > 0) {
         // UPDATE existing record to 'Fresh' status
         const id = existingQuery[0].values[0][0];
         db.run(`
            UPDATE trending_articles 
            SET views = views + ?, rank = ?, timestamp = ?, thumbnail_url = COALESCE(thumbnail_url, ?), originalimage_url = COALESCE(originalimage_url, ?)
            WHERE id = ?
         `, [item.views, i + 1, timestamp, item.thumbnail || null, item.originalimage || null, id]);
      } else {
         // INSERT new record
         db.run(`
            INSERT INTO trending_articles (title, views, rank, timestamp, article_url, thumbnail_url, originalimage_url, description, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         `, [
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
    }
    saveDb();

    console.log(
      `[Scraper] Successfully stored ${enrichedArticles.length} combined multi-source articles at ${timestamp}`
    );
  } catch (error) {
    console.error(`[Scraper] Error: ${error.message}`);
  }
}



module.exports = { fetchTrendingArticles };
