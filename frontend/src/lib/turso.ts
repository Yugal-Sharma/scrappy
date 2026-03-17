import { createClient } from "@libsql/client";

/**
 * Turso Database Client
 * This client connects to the hosted SQLite database on Turso.
 * 100% Free, Zero Payment Prompt.
 */

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.warn("Turso env variables are missing. Database operations will fail in production.");
}

export const db = createClient({
  url: url || "file:wiki_data.db", // Fallback to local for dev if env missing
  authToken: authToken,
});

/**
 * Ensures the required tables exist in Turso
 */
export async function initTursoTables() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trending_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      views INTEGER NOT NULL,
      rank INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      article_url TEXT NOT NULL,
      thumbnail_url TEXT,
      originalimage_url TEXT,
      description TEXT,
      category TEXT
    )
  `);
  
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_timestamp ON trending_articles(timestamp)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_rank ON trending_articles(rank)`);
}
