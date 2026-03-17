import React, { useEffect, useState } from "react";
import { ArrowUpRight, Eye, Sparkles, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import axios from "axios";

interface TrendingCardProps {
  title: string;
  views: number;
  url: string;
  rank: number;
}

export function TrendingCard({ title, views, url, rank }: TrendingCardProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get(`/api/article/${encodeURIComponent(title)}/history`);
        setHistory(res.data.history || []);
      } catch (err) {
        // console.error("Could not fetch history for chart", err);
      }
    }
    fetchHistory();
  }, [title]);

  const loadInsight = async () => {
    setIsInsightOpen(true);
    if (insight) return; // Don't fetch twice

    setInsightLoading(true);
    try {
      const res = await axios.post("/api/insight", { title });
      setInsight(res.data.insight);
    } catch (err) {
      setInsight(`Looks like ${title} is trending organically!`);
    } finally {
      setInsightLoading(false);
    }
  };

  // Format large numbers (e.g., 1500000 -> 1.5M)
  const formatViews = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <>
      <div 
        onClick={loadInsight}
        className="group cursor-pointer relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
      >
        
        {/* Rank Badge */}
        <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 z-10 transition-colors group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800">
          #{rank}
        </div>

        <div className="mb-4 pr-10 z-10 relative">
          <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
        </div>

        {/* Sparkline Chart */}
        <div className="absolute inset-x-0 bottom-16 h-24 opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none">
          {history.length > 1 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id={`gradient-${rank}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill={`url(#gradient-${rank})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-900 z-10 relative bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Eye className="h-4 w-4" />
            <span className="font-medium">{formatViews(views)} views</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors group-hover:text-emerald-700 dark:text-emerald-400 dark:group-hover:text-emerald-300">
            <Sparkles className="h-4 w-4" /> Why?
          </div>
        </div>
      </div>

      {/* AI Insight Modal Overlay */}
      {isInsightOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200" onClick={() => setIsInsightOpen(false)}>
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">AI Viral Insight</h3>
              </div>
              <button 
                onClick={() => setIsInsightOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h4>
              
              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950/50">
                {insightLoading ? (
                  <div className="flex items-center gap-3 text-zinc-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <span>Analyzing Wikipedia trends...</span>
                  </div>
                ) : (
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {insight}
                  </p>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Read Full Article <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
