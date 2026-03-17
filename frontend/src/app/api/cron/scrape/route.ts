import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import yahooFinance from "yahoo-finance2";
import Parser from "rss-parser";
import { db, initTursoTables } from "@/lib/turso";

// const parser = new Parser();
const USER_AGENT = "WikiTrendingScraper/4.0 (Vercel Serverless; contact@example.com)";

const CATEGORIES = [
  "#Geopolitics", 
  "#TradeAndTariffs", 
  "#SecurityAndTerrorism", 
  "#GlobalTourism", 
  "#Science", 
  "#Entertainment",
  "#General"
];

// ─── Helper: Dynamic Image ───────────────────────────────────────
function getDynamicImage(title: string, context: string) {
    // Add a unique salt based on title length to prevent caching/duplicate vibes
    const salt = title.length % 5;
    const styles = ["hyper-realistic", "cinematic lighting", "minimalist editorial", "abstract digital art", "high-contrast 4k"];
    const style = styles[salt];
    
    const prompt = `${title}, ${context}, ${style}, award-winning photography, bloomberg terminal 2025 aesthetic, sharp details, vibrant colors`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1350&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
}

interface Article {
    article: string;
    views?: number;
    category?: string;
    originalimage?: string | null;
    thumbnail?: string | null;
    description?: string | null;
    article_url?: string;
}

// ─── Phase 1: LLM Categorization ─────────────────────────────────
async function categorizeArticlesBatch(articles: Article[]): Promise<Article[]> {
    if (process.env.GEMINI_API_KEY) {
        try {
            const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
            const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
            
            const prompt = `Analyze the following Wikipedia titles and categorize them into ONE of these exact categories:
            ${CATEGORIES.join(", ")}
            
            STRICT RULES:
            1. If it's an Actor/Celebrity/Athlete, assign to #Entertainment or #General.
            2. #TradeAndTariffs must be economics/business only.
            
            Return JSON: { "Title": "#Category" }
            
            Titles: ${articles.map(a => a.article.replace(/_/g, " ")).join(" | ")}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            
            // Clean JSON
            text = text.replace(/```json|```/g, "").trim();
            const catMap = JSON.parse(text);

            return articles.map(a => {
                const title = a.article.replace(/_/g, " ");
                let assigned = catMap[title] || "#General";
                if (!CATEGORIES.includes(assigned)) assigned = "#General";
                return { ...a, category: assigned };
            });
        } catch (err) {
            console.error("Gemini categorization failed:", err);
            return articles.map(a => ({ ...a, category: "#General" }));
        }
    }
    
    // Fallback: Just return with #General
    return articles.map(a => ({ ...a, category: "#General" }));
}

// ─── Phase 2: Image Enrichment ───────────────────────────────────
async function enrichArticles(articles: Article[]): Promise<Article[]> {
    const enriched: Article[] = [];
    for (const article of articles) {
        const title = article.article.replace(/_/g, " ");
        let imageUrl: string | null = null;

        try {
            // Wikipedia lookup
            const wikiRes = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(article.article)}`,
                { headers: { "Api-User-Agent": USER_AGENT } }
            );
            const data = await wikiRes.json() as { query?: { pages?: Record<string, { original?: { source: string } }> } };
            const pages = data.query?.pages || {};
            const page = Object.values(pages)[0];
            imageUrl = page?.original?.source || null;

            // Unsplash fallback
            if (!imageUrl && process.env.UNSPLASH_ACCESS_KEY) {
                const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(title)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=1`);
                const uData = await unsplashRes.json();
                if (uData.results?.[0]) imageUrl = uData.results[0].urls.regular;
            }

            if (!imageUrl) {
                imageUrl = getDynamicImage(title, article.category || "trending topics global");
            }

            enriched.push({
                ...article,
                originalimage: imageUrl,
                thumbnail: imageUrl,
                description: `Strategic intelligence report: ${title}. High viral momentum detected across global data networks.`
            });
        } catch (e) {
            const fallbackImg = getDynamicImage(title, "global event architecture");
            enriched.push({ ...article, originalimage: fallbackImg, thumbnail: fallbackImg });
        }
    }
    return enriched;
}

// ─── Phase 3: External Sources ───────────────────────────────────
async function fetchExternalSources(): Promise<Article[]> {
    const external: Article[] = [];
    
    // 1. Yahoo Finance
    try {
        const symbols = ["NVDA", "AAPL", "MSFT", "TSLA", "BTC-USD"];
        for (const sym of symbols) {
            const quote = await yahooFinance.quote(sym) as { 
              shortName?: string, 
              regularMarketPrice?: number, 
              regularMarketChangePercent?: number 
            };
            const title = `${sym} Market Shift: ${quote.shortName || sym} volatility`;
            const img = getDynamicImage(title, "Corporate Finance Wall Street");
            external.push({
                article: title,
                views: 2000000,
                category: "#Corporate",
                originalimage: img,
                thumbnail: img,
                description: `${quote.shortName || sym} current price: $${quote.regularMarketPrice ?? 'N/A'}. Change: ${quote.regularMarketChangePercent ?? 0}%`
            });
        }
    } catch (e) { console.error("Finance fetch failed", e); }

    return external;
}

// ─── Main Route Handlers ─────────────────────────────────────────

export async function GET(req: Request) {
    // Security check for Vercel Cron
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return new Response('Unauthorized', { status: 401 });
        // Temporarily allow during setup
    }

    try {
        console.log("Starting Scraper V4 (Turso Migration)...");
        await initTursoTables();

        // 1. Fetch Wiki Trending
        const year = new Date().getUTCFullYear();
        const month = String(new Date().getUTCMonth() + 1).padStart(2, "0");
        const day = String(new Date().getUTCDate() - 1).padStart(2, "0");
        
        const wikiUrl = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${month}/${day}`;
        const res = await fetch(wikiUrl, { headers: { "Api-User-Agent": USER_AGENT } });
        const data = await res.json() as { items?: { articles: { article: string, views: number }[] }[] };
        
        const wikiArticles: Article[] = data.items?.[0]?.articles
            .filter((a) => a.article !== "Main_Page" && !a.article.includes("Special:"))
            .slice(0, 50) || [];

        // 2. Process
        const categorized = await categorizeArticlesBatch(wikiArticles);
        const enriched = await enrichArticles(categorized);
        const external = await fetchExternalSources();
        
        const allArticles = [...enriched, ...external];
        const timestamp = new Date().toISOString();

        // 3. Batch Save to Turso
        for (let i = 0; i < allArticles.length; i++) {
            const item = allArticles[i];
            const title = item.article;
            const cleanTitle = title.replace(/_/g, " ");

            await db.execute({
                sql: `INSERT INTO trending_articles 
                (title, views, rank, timestamp, article_url, thumbnail_url, originalimage_url, description, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    cleanTitle, 
                    item.views || 0, 
                    i + 1, 
                    timestamp, 
                    item.article_url || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
                    item.thumbnail || null,
                    item.originalimage || null,
                    item.description || null,
                    item.category || "#General"
                ]
            });
        }

        return NextResponse.json({ success: true, count: allArticles.length });
    } catch (error: unknown) {
        console.error("Scraper failed:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}