const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const http = require("http");
const { Server } = require("socket.io");
const { getDb } = require("./database");
const { fetchTrendingArticles } = require("./scraper");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 8000;

app.use(cors());
app.use(express.json());

// ─── Websocket Logger ────────────────────────────────────────────
// Capture console.log and broadcast to all connected clients
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function() {
  const msg = Array.from(arguments).join(" ");
  io.emit("log", { type: "info", message: msg, timestamp: new Date().toISOString() });
  originalConsoleLog.apply(console, arguments);
};

console.error = function() {
  const msg = Array.from(arguments).join(" ");
  io.emit("log", { type: "error", message: msg, timestamp: new Date().toISOString() });
  originalConsoleError.apply(console, arguments);
};

io.on("connection", (socket) => {
  originalConsoleLog(`[WebSocket] Client connected: ${socket.id}`);
  socket.emit("log", { type: "info", message: "Connected to Wikipedia Scraper Agent stream.", timestamp: new Date().toISOString() });
});

// ─── Global Scraper Status ───────────────────────────────────────
let nextScrapeTime = null;

function setNextScrapeTime() {
  const now = new Date();
  // Next 30 minute mark
  const next = new Date(now);
  if (now.getMinutes() < 30) {
    next.setMinutes(30, 0, 0);
  } else {
    next.setHours(now.getHours() + 1, 0, 0, 0);
  }
  nextScrapeTime = next;
}
setNextScrapeTime();

// ─── API Routes ──────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({ status: "Wikipedia Trending Scraper API is running" });
});

app.get("/api/status", (req, res) => {
  const now = new Date();
  const msUntilNext = nextScrapeTime ? nextScrapeTime.getTime() - now.getTime() : 0;
  
  res.json({ 
    status: "active",
    nextScrapeTime: nextScrapeTime,
    msUntilNextScrape: Math.max(0, msUntilNext)
  });
});

app.get("/api/trending", async (req, res) => {
  try {
    const db = await getDb();
    const latestResult = db.exec("SELECT timestamp FROM trending_articles ORDER BY timestamp DESC LIMIT 1");

    if (!latestResult.length || !latestResult[0].values.length) {
      return res.json({ articles: [], lastUpdated: null });
    }

    const latestTimestamp = latestResult[0].values[0][0];
    const articlesResult = db.exec(
      "SELECT id, title, views, rank, timestamp, article_url, thumbnail_url, originalimage_url, description, category FROM trending_articles WHERE timestamp = ? ORDER BY rank ASC",
      [latestTimestamp]
    );

    if (!articlesResult.length) {
      return res.json({ articles: [], lastUpdated: latestTimestamp });
    }

    const columns = articlesResult[0].columns;
    const articles = articlesResult[0].values.map((row) => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });

    res.json({
      articles,
      lastUpdated: latestTimestamp,
    });
  } catch (error) {
    console.error("Error fetching trending:", error);
    res.status(500).json({ error: "Failed to fetch trending articles" });
  }
});
// Get latest trending articles for a specific category
app.get("/api/category/:category", async (req, res) => {
  try {
    const db = await getDb();
    const { category } = req.params;
    
    // First find the latest timestamp, or 30-min window constraint
    const latestResult = db.exec(
      "SELECT timestamp FROM trending_articles ORDER BY timestamp DESC LIMIT 1"
    );

    if (latestResult.length === 0 || !latestResult[0].values.length) {
      return res.json({ articles: [], lastUpdated: null });
    }

    const latestTimestamp = latestResult[0].values[0][0];
    
    let queryCategory = category;
    if (!queryCategory.startsWith('#')) {
      queryCategory = '#' + queryCategory;
    }

    const articlesResult = db.exec(
      "SELECT id, title, views, rank, timestamp, article_url, thumbnail_url, originalimage_url, description, category FROM trending_articles WHERE timestamp = ? AND category = ? ORDER BY rank ASC",
      [latestTimestamp, queryCategory]
    );

    if (articlesResult.length === 0 || !articlesResult[0].values.length) {
      return res.json({ articles: [], lastUpdated: latestTimestamp });
    }

    const columns = articlesResult[0].columns;
    const articles = articlesResult[0].values.map((row) => {
      const article = {};
      columns.forEach((col, index) => {
        article[col] = row[index];
      });
      return article;
    });

    res.json({
      articles,
      lastUpdated: latestTimestamp,
    });
  } catch (error) {
    console.error("Error fetching category articles:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Historical views for sparklines 
app.get("/api/article/:title/history", async (req, res) => {
  try {
    const db = await getDb();
    const title = req.params.title;
    
    // Get the last 10 entries for this article to build a sparkline
    const result = db.exec(
      "SELECT timestamp, views, rank FROM trending_articles WHERE title = ? ORDER BY timestamp ASC LIMIT 10",
      [title]
    );

    if (!result.length) {
      return res.json({ history: [] });
    }

    const columns = result[0].columns;
    const history = result[0].values.map((row) => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });

    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch article history" });
  }
});
// Get top trending keywords for the Live Ticker
app.get("/api/ticker", async (req, res) => {
  try {
    const db = await getDb();
    
    // Get the latest timestamp
    const latestResult = db.exec(
      "SELECT timestamp FROM trending_articles ORDER BY timestamp DESC LIMIT 1"
    );

    if (latestResult.length === 0 || !latestResult[0].values.length) {
      return res.json({ keywords: [] });
    }

    const latestTimestamp = latestResult[0].values[0][0];
    
    // Fetch top 30 titles from the latest scrape
    const titlesResult = db.exec(
      "SELECT title FROM trending_articles WHERE timestamp = ? LIMIT 30",
      [latestTimestamp]
    );

    if (titlesResult.length === 0 || !titlesResult[0].values.length) {
      return res.json({ keywords: [] });
    }

    // Extract keywords
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "are", "was", "were", "stock", "analysis", "update"]);
    const wordCounts = {};
    
    titlesResult[0].values.forEach(row => {
      const title = row[0];
      if (typeof title === 'string') {
          const words = title.split(' ');
          words.forEach(w => {
            const clean = w.replace(/[^a-zA-Z0-9]/g, '');
            if (clean.length > 3 && !stopWords.has(clean.toLowerCase())) {
                wordCounts[clean.toUpperCase()] = (wordCounts[clean.toUpperCase()] || 0) + 1;
            }
          });
      }
    });

    // Sort and get top 15
    const topKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(entry => entry[0]);
      
    // Mix in some hardcoded financial indices for the Bloomber look
    const mixedTicker = ["^GSPC", ...topKeywords.slice(0, 5), "^DJI", ...topKeywords.slice(5, 10), "BTC-USD", ...topKeywords.slice(10)];

    res.json({ keywords: mixedTicker });
  } catch (error) {
    console.error("Error fetching ticker data:", error);
    res.status(500).json({ error: "Failed to fetch ticker data" });
  }
});

// Manual trigger for scraping
app.post("/api/scrape", async (req, res) => {
  try {
    console.log("[Agent] Manual scrape triggered by user.");
    await fetchTrendingArticles();
    setNextScrapeTime();
    res.json({ message: "Scraping completed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Scraping failed" });
  }
});

// ─── Schedule Scraper ────────────────────────────────────────────

// Run every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("[Agent] Running scheduled 30-min heartbeat scrape...");
  await fetchTrendingArticles();
  setNextScrapeTime();
});

// ─── Start Server ────────────────────────────────────────────────

server.listen(PORT, async () => {
  originalConsoleLog(`\n🚀 Wikipedia Trending API running at http://localhost:${PORT}`);
  originalConsoleLog(`📊 Scraper scheduled every 30 minutes. Next scrape at: ${nextScrapeTime.toLocaleTimeString()}\n`);

  // Run initial scrape on startup
  console.log("[Agent] System initialized. Running first-time data fetch...");
  await fetchTrendingArticles();
});
