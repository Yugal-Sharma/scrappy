import React, { useEffect, useState } from "react";
import { ArrowUpRight, Eye, Sparkles, X } from "lucide-react";
import Image from "next/image";
import axios from "axios";

interface TrendingCardProps {
  title: string;
  views: number;
  url: string;
  rank: number;
  image?: string;
  category?: string;
  isHero?: boolean;
}

const CATEGORY_IMAGES: Record<string, string> = {
  "#Geopolitics": "https://images.unsplash.com/photo-1529107386315-e1c73906504e?q=80&w=800",
  "#Entertainment": "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?q=80&w=800",
  "#Science": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800",
  "#WorldNews": "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800",
  "#Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800",
  "#Technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800",
  "#History": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800",
  "#General": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800",
};

export function TrendingCard({ title, views, url, rank, image, category = "#General", isHero = false }: TrendingCardProps) {
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const heroImage = image || CATEGORY_IMAGES[category] || CATEGORY_IMAGES["#General"];

  const loadInsight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInsightOpen(true);
    if (insight) return; 

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

  const formatViews = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <>
      <div 
        onClick={loadInsight}
        className={`group cursor-pointer relative flex flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 transition-all hover:border-white/20 hover:shadow-2xl ${
          isHero ? "min-h-[400px] md:min-h-[500px]" : "min-h-[280px]"
        }`}
      >
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Magazine Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        </div>
        
        {/* Rank & Category Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <div className="flex px-3 py-1 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/5 text-xs font-semibold text-white">
            #{rank}
          </div>
          <div className="flex px-3 py-1 items-center justify-center rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/10 text-xs font-medium text-emerald-300">
            {category}
          </div>
        </div>

        {/* Glassmorphic Content Block */}
        <div className="relative z-10 p-5 w-full">
          <h3 className={`font-[family-name:var(--font-playfair)] tracking-tight text-white mb-3 line-clamp-3 ${
            isHero ? "text-3xl md:text-5xl font-bold" : "text-xl font-semibold"
          }`}>
            {title}
          </h3>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Eye className="h-4 w-4" />
              <span className="font-medium">{formatViews(views)}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <Sparkles className="h-4 w-4" /> Why?
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Modal Overlay */}
      {isInsightOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsInsightOpen(false)}>
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-[#111111] shadow-2xl border border-white/10"
          >
            <div className="relative h-48 w-full">
               <Image src={heroImage} alt={title} fill className="object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
               <button 
                  onClick={() => setIsInsightOpen(false)}
                  className="absolute top-4 right-4 rounded-full p-2 bg-black/50 text-white hover:bg-black/80 backdrop-blur-md transition-colors z-20"
                >
                  <X className="h-5 w-5" />
                </button>
            </div>
            
            <div className="p-8 pb-10 relative -mt-16 z-20">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-semibold tracking-wider uppercase">AI Insight</span>
              </div>
              <h4 className="mb-6 font-[family-name:var(--font-playfair)] text-3xl font-bold text-white leading-tight">{title}</h4>
              
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 backdrop-blur-md">
                {insightLoading ? (
                  <div className="flex items-center gap-3 text-zinc-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <span className="text-sm font-medium">Scanning global feeds...</span>
                  </div>
                ) : (
                  <p className="text-zinc-300 leading-relaxed text-lg">
                    {insight}
                  </p>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
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
