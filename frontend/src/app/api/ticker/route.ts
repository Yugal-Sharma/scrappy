import { NextResponse } from "next/server";
import { db, initTursoTables } from "@/lib/turso";

export async function GET() {
  try {
    // Ensure tables exist before querying
    await initTursoTables();
    const result = await db.execute(`
      SELECT DISTINCT title 
      FROM trending_articles 
      WHERE timestamp > datetime('now', '-1 day')
      ORDER BY views DESC 
      LIMIT 15
    `);

    const keywords = result.rows.map(row => row.title as string);

    return NextResponse.json({
      keywords: keywords.length > 0 ? keywords : ["MARKETS", "AI", "TECH", "GLOBAL", "ECONOMY", "TRADE", "SCIENCE"],
      status: "success"
    });
  } catch (error) {
    console.error("Failed to fetch ticker keywords from Turso:", error);
    return NextResponse.json({ 
      keywords: ["MARKETS", "AI", "TECH", "GLOBAL", "ECONOMY", "TRADE", "SCIENCE"],
      status: "fallback"
    });
  }
}
