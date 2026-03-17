"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { TrendingCard } from "@/components/ui/trending-card";
import { LiveAgentConsole } from "@/components/ui/live-agent-console";
import { Activity, Clock, RefreshCw } from "lucide-react";

interface Article {
  id: number;
  title: string;
  views: number;
  rank: number;
  timestamp: string;
  article_url: string;
  thumbnail_url: string | null;
  description: string | null;
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
      // We will proxy /api to the backend in next.config.ts
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

  // Fetch immediately and set up 1-minute interval
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

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 dark:bg-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Wikipedia Viral Dashboard
            </h1>
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              Live tracking of the most viewed articles over the last 30 minutes.
            </p>
          </div>

          {/* Scraper Status Badge */}
          <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className={`flex items-center gap-2 text-sm font-medium ${error ? 'text-red-600 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
              <Activity className={`h-4 w-4 ${loading ? 'animate-pulse' : ''} ${error ? 'text-red-500' : 'text-green-500'}`} />
              {error ? "Backend Offline" : "Scraper Active"}
            </div>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Clock className="h-4 w-4" />
              <span>Sync: {formatTime(lastSync)}</span>
            </div>
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="ml-2 rounded-md p-1 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800 transition-colors"
              title="Refresh manually"
            >
              <RefreshCw className={`h-4 w-4 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {error && data.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
            <Activity className="mb-4 h-8 w-8 text-red-500" />
            <p className="text-lg font-medium text-red-800 dark:text-red-400">Backend currently unavailable</p>
            <p className="text-sm text-red-600 dark:text-red-500">Please make sure the scraping server is running on port 8000</p>
          </div>
        ) : data.length === 0 && !loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">No trending data available yet.</p>
            <p className="text-sm text-zinc-500">Checking again in a minute...</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((article) => (
              <TrendingCard
                key={article.id}
                title={article.title}
                views={article.views}
                url={article.article_url}
                rank={article.rank}
              />
            ))}
            
            {/* Loading skeletons for initial load */}
            {loading && data.length === 0 && (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              ))
            )}
          </div>
        )}
        
      </div>

      {/* Live Agent Console Section */}
      <div className="mx-auto max-w-7xl pb-12 px-4 sm:px-6 lg:px-8 mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-12">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          System Overview
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Real-time event stream from the node.js scraping agent and WebSocket server.
        </p>
        <LiveAgentConsole />
      </div>

    </div>
  );
}
