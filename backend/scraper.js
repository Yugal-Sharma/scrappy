const { getDb, saveDb } = require("./database");

const USER_AGENT =
  "WikiTrendingScraper/1.0 (https://github.com/scraper; contact@example.com)";

async function fetchTrendingArticles() {
  try {
    const db = await getDb();

    // Use yesterday's date since today's data may be incomplete
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

    // Check if we already have data for this 30-min window
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

    // Fetch summaries for top articles (get thumbnails and descriptions)
    const enrichedArticles = await enrichArticles(articles);

    // Insert all articles
    const stmt = db.prepare(`
      INSERT INTO trending_articles (title, views, rank, timestamp, article_url, thumbnail_url, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < enrichedArticles.length; i++) {
      const item = enrichedArticles[i];
      const title = item.article.replace(/_/g, " ");
      const articleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(item.article)}`;

      stmt.run([
        title,
        item.views,
        i + 1,
        timestamp,
        articleUrl,
        item.thumbnail || null,
        item.description || null,
      ]);
    }

    stmt.free();
    saveDb();

    console.log(
      `[Scraper] Successfully stored ${enrichedArticles.length} articles at ${timestamp}`
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
    const promises = batch.map(async (article) => {
      try {
        if (
          article.article.startsWith("Special:") ||
          article.article === "Main_Page"
        ) {
          return { ...article, thumbnail: null, description: null };
        }

        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article.article)}`;
        const res = await fetch(summaryUrl, {
          headers: { "Api-User-Agent": USER_AGENT },
        });

        if (res.ok) {
          const summary = await res.json();
          return {
            ...article,
            thumbnail: summary.thumbnail?.source || null,
            description: summary.extract
              ? summary.extract.substring(0, 200)
              : null,
          };
        }
        return { ...article, thumbnail: null, description: null };
      } catch {
        return { ...article, thumbnail: null, description: null };
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
