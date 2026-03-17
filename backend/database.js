const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "wiki_data.db");

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  // Load existing database if it exists
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS trending_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      views INTEGER NOT NULL,
      rank INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      article_url TEXT NOT NULL,
      thumbnail_url TEXT,
      description TEXT
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON trending_articles(timestamp)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_rank ON trending_articles(rank)`);

  saveDb();
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

module.exports = { getDb, saveDb };
