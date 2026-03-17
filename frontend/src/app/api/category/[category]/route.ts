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

    // Get the most recent articles for THIS specific category from the last 24 hours
    const result = await db.execute({
      sql: `SELECT * FROM trending_articles 
            WHERE LOWER(category) = LOWER(?) 
            AND timestamp > datetime('now', '-1 day')
            ORDER BY timestamp DESC, rank ASC 
            LIMIT 50`,
      args: [queryCategory.trim()]
    });

    // Use the latest timestamp from the category results as the 'last updated' for this view
    const lastUpdated = result.rows.length > 0 ? (result.rows[0].timestamp as string) : null;

    return NextResponse.json({
      articles: result.rows,
      lastUpdated: lastUpdated,
    });
  } catch (error) {
    console.error("Failed to fetch category data from Turso:", error);
    return NextResponse.json({ error: "Failed to fetch category data" }, { status: 500 });
  }
}
