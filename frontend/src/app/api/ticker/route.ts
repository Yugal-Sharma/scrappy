import { NextResponse } from "next/server";
import { db } from "@/lib/turso";

export async function GET() {
  try {
    // Attempt to get unique titles from the last 24 hours to use as high-momentum ticker items
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
