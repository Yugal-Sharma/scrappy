import { NextResponse } from "next/server";
import { db } from "@/lib/turso";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    
    // Ensure it starts with #
    let queryCategory = decodedCategory;
    if (!queryCategory.startsWith('#')) {
      queryCategory = '#' + queryCategory;
    }

    // Get the latest timestamp from the DB
    const latestRes = await db.execute("SELECT timestamp FROM trending_articles ORDER BY timestamp DESC LIMIT 1");
    if (latestRes.rows.length === 0) {
      return NextResponse.json({ articles: [], lastUpdated: null });
    }
    const latestTimestamp = latestRes.rows[0].timestamp;

    const result = await db.execute({
      sql: `SELECT * FROM trending_articles 
            WHERE timestamp = ? AND LOWER(category) = LOWER(?) 
            ORDER BY rank ASC`,
      args: [latestTimestamp, queryCategory.trim()]
    });

    return NextResponse.json({
      articles: result.rows,
      lastUpdated: latestTimestamp,
    });
  } catch (error) {
    console.error("Failed to fetch category data from Turso:", error);
    return NextResponse.json({ error: "Failed to fetch category data" }, { status: 500 });
  }
}
