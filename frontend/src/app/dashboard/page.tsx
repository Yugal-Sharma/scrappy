"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { TrendingCard } from "@/components/ui/trending-card";
import { LiveAgentConsole } from "@/components/ui/live-agent-console";
import { Activity, Clock, RefreshCw, Flame, Globe } from "lucide-react";

interface Article {
  id: number;
  title: string;
  views: number;
  rank: number;
  timestamp: string;
  article_url: string;
  thumbnail_url: string | null;
  originalimage_url: string | null;
  description: string | null;
  category: string;
}

interface TrendingResponse {
  articles: Article[];
  lastUpdated: string | null;
}

export default function WikipediaDashboard() {
  const [data, setData] = useState<Article[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<TrendingResponse>("/api/trending");
      
      setData(response.data.articles || []);
      setLastSync(response.data.lastUpdated);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch trending data:", err);
      setError("Failed to connect to the scraper backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "Never";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const topStory = data.length > 0 ? data[0] : null;
  const remainingArticles = data.length > 1 ? data.slice(1) : [];

  // Get Top 3 categories for the sidebar briefing
  const topEvents = remainingArticles.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-inter)] selection:bg-emerald-500/30">
      <div className="mx-auto max-w-[1400px]">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl font-[family-name:var(--font-playfair)]">
              Discovery Hub
            </h1>
            <p className="mt-3 text-lg text-zinc-400">
              Curated global trends updated every 30 minutes by our autonomous agent.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
             {/* Scraper Status Badge */}
            <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2 shadow-2xl">
              <div className={`flex items-center gap-2 text-sm font-semibold tracking-wide uppercase ${error ? 'text-red-400' : 'text-emerald-400'}`}>
                <Activity className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                {error ? "Backend Offline" : "Scraper Active"}
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                <Clock className="h-4 w-4" />
                <span>Sync: {formatTime(lastSync)}</span>
              </div>
              <button 
                onClick={fetchData} 
                disabled={loading}
                className="ml-2 rounded-full p-1.5 hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {error && data.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-red-500/30 bg-red-500/5 backdrop-blur-xl">
            <Activity className="mb-4 h-10 w-10 text-red-500 animate-pulse" />
            <p className="text-xl font-medium text-red-400 mb-2">Backend currently unavailable</p>
            <p className="text-zinc-500">Please make sure the scraping server is running on port 8000</p>
          </div>
        ) : data.length === 0 && !loading ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 backdrop-blur-xl">
            <p className="text-xl font-medium text-zinc-400">No trending data available yet.</p>
            <p className="text-sm text-zinc-500 mt-2">Checking again in a minute...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Main Content (Hero + Grid) */}
            <div className="flex-1 flex flex-col gap-8 w-full block">
              {/* Hero Section */}
              {topStory && (
                <div className="w-full">
                  <div className="mb-4 flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-sm">
                    <Flame className="h-5 w-5" /> Top Story
                  </div>
                  <TrendingCard
                    title={topStory.title}
                    views={topStory.views}
                    url={topStory.article_url}
                    rank={topStory.rank}
                    image={topStory.originalimage_url || topStory.thumbnail_url || undefined}
                    category={topStory.category}
                    isHero={true}
                  />
                </div>
              )}

              {/* Magazine Grid */}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {remainingArticles.map((article, idx) => (
                  <div key={article.id} className={idx === 0 || idx === 3 ? "sm:col-span-2 xl:col-span-2" : "col-span-1"}>
                    <TrendingCard
                      title={article.title}
                      views={article.views}
                      url={article.article_url}
                      rank={article.rank}
                      image={article.originalimage_url || article.thumbnail_url || undefined}
                      category={article.category}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar: Daily Briefing */}
            <div className="w-full lg:w-[350px] shrink-0">
              <div className="sticky top-12 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                 <div className="flex items-center gap-3 mb-8">
                    <Globe className="h-6 w-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-playfair)]">Daily Briefing</h2>
                 </div>
                 
                 <div className="flex flex-col gap-6 relative">
                    {/* Minimalist Timeline Line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10"></div>

                    {topEvents.map((event, i) => (
                      <div key={i} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full bg-[#111] border-4 border-[#0a0a0a] flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        </div>
                        
                        <div className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">{event.category}</div>
                        <h4 className="text-white font-semibold leading-snug mb-2 font-[family-name:var(--font-playfair)] text-lg">{event.title}</h4>
                        <p className="text-sm text-zinc-400 line-clamp-3">
                          {event.description || "No description available for this trending topic."}
                        </p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

          </div>
        )}
        
      </div>

      {/* Live Agent Console Section */}
      <div className="mx-auto max-w-[1400px] pb-12 mt-20 border-t border-white/10 pt-16">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2 font-[family-name:var(--font-playfair)]">
          System Overview
        </h2>
        <p className="text-zinc-400 text-sm mb-8">
          Real-time event stream from the Node.js scraping agent and WebSocket server.
        </p>
        <LiveAgentConsole />
      </div>

    </div>
  );
}
