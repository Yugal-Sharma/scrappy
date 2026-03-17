import { NextResponse } from "next/server";
import { db } from "@/lib/turso";

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT * FROM trending_articles 
      ORDER BY timestamp DESC, rank ASC 
      LIMIT 100
    `);

    // Get the latest timestamp from the results as a surrogate for last updated
    const lastUpdated = result.rows.length > 0 ? (result.rows[0].timestamp as string) : null;

    return NextResponse.json({
      articles: result.rows,
      lastUpdated: lastUpdated,
    });
  } catch (error) {
    console.error("Failed to fetch trending data from Turso:", error);
    return NextResponse.json({ error: "Failed to fetch trending data" }, { status: 500 });
  }
}
