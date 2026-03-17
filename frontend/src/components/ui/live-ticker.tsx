"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp, BarChart2 } from "lucide-react";

export function LiveTicker() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTicker() {
      try {
        const res = await axios.get("/api/ticker");
        if (res.data.keywords && res.data.keywords.length > 0) {
            setKeywords(res.data.keywords);
        } else {
            // Fallback generic Bloomberg-esque terms
            setKeywords(["^GSPC", "MARKETS", "GLOBAL", "AI", "ECONOMY", "TECH", "^DJI", "ENERGY", "RATES", "INFRASTRUCTURE"]);
        }
      } catch (_err) {
        setKeywords(["^GSPC", "MARKETS", "GLOBAL", "AI", "ECONOMY", "TECH", "^DJI", "ENERGY"]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTicker();
    const interval = setInterval(fetchTicker, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="w-full h-10 bg-black border-b border-white/5 flex items-center px-4 overflow-hidden sticky top-0 z-50">
        <div className="h-3 w-32 bg-white/10 animate-pulse rounded"></div>
    </div>
  );

  return (
    <div className="w-full h-10 bg-black border-b border-white/10 flex items-center overflow-hidden sticky top-0 z-50 shadow-md view-border-box">
      
      {/* Live Label Fixed Left */}
      <div className="flex items-center gap-2 px-4 h-full bg-emerald-950/40 border-r border-emerald-900/30 shrink-0 z-10 backdrop-blur-sm">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-[family-name:var(--font-inter)]">Live</span>
      </div>

      {/* Marquee Container */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        <div className="animate-marquee flex whitespace-nowrap items-center h-full">
          {/* Double the array for seamless endless scrolling */}
          {[...keywords, ...keywords, ...keywords].map((word, idx) => (
            <div key={idx} className="flex items-center px-6 shrink-0 h-full">
              {idx % 4 === 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500 mr-2 opacity-70" />
              ) : idx % 3 === 0 ? (
                  <BarChart2 className="h-3 w-3 text-emerald-500 mr-2 opacity-70" />
              ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mr-4 inline-block" />
              )}
              <span className={`text-xs font-semibold tracking-wider font-[family-name:var(--font-inter)] ${idx % 5 === 0 ? 'text-white' : 'text-zinc-400'}`}>
                  {word}
                  {idx % 5 === 0 && <span className="ml-2 text-emerald-500 font-mono">+{(Math.random() * 2).toFixed(2)}%</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}} />
    </div>
  );
}
