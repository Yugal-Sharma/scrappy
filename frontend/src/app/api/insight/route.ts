import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK
// It will automatically use process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  let title;
  try {
    const json = await req.json();
    title = json.title;

    if (!title) {
      return NextResponse.json(
        { error: "Article title is required" },
        { status: 400 }
      );
    }

    const prompt = `Give a one-sentence witty explanation of why the Wikipedia article for "${title}" might be trending or viral right now. Keep it brief and engaging.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      insight: response.text || "No insights available right now.",
    });
  } catch (error) {
    console.error("Error generating AI insight:", error);
    // If there's no API key or it fails, fallback gracefully
    return NextResponse.json(
      { insight: `Looks like ${title || 'this topic'} is trending organically!` },
      { status: 200 } // Still return 200 so the UI doesn't break
    );
  }
}
