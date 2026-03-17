"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowUpRight, ChevronDown, Activity, Sparkles, X } from "lucide-react";
import { useParams } from "next/navigation";
import { getCategoryFallback } from "@/lib/categoryImages";

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

export default function CategoryExplorePage() {
  const params = useParams();
  const categoryParam = params.category as string;
  const decodedCategory = decodeURIComponent(categoryParam);
  
  // Convert URL friendly param back to hashtag, e.g., 'securityandterrorism' -> '#SecurityAndTerrorism'
  const getHashtagFromParam = (param: string) => {
    switch (param.toLowerCase()) {
      case "geopolitics": return "#Geopolitics";
      case "tradeandtariffs": return "#TradeAndTariffs";
      case "securityandterrorism": return "#SecurityAndTerrorism";
      case "globaltourism": return "#GlobalTourism";
      case "entertainment": return "#Entertainment";
      case "science": return "#Science";
      case "corporate": return "#Corporate";
      case "automotive": return "#Automotive";
      case "movies": return "#Movies";
      case "music": return "#Music";
      default: return `#${param.charAt(0).toUpperCase() + param.slice(1)}`;
    }
  };

  const dbCategory = getHashtagFromParam(decodedCategory);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Insight State
  const [insightData, setInsightData] = useState<{ title: string; text: string } | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/category/${encodeURIComponent(dbCategory)}?t=${Date.now()}`);
        setArticles(res.data.articles || []);
      } catch (err) {
        console.error("Failed to fetch categorized articles", err);
        setError("Error fetching data for this category.");
      } finally {
        setLoading(false);
      }
    }
    fetchCategoryData();
  }, [dbCategory]);

  const fetchInsight = async (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInsightLoading(true);
    // Open modal immediately with loading state
    setInsightData({ title, text: "" }); 
    try {
      const res = await axios.post("/api/insight", { title });
      setInsightData({ title, text: res.data.insight });
    } catch {
      setInsightData({ title, text: "Trending organically across Wikipedia." });
    } finally {
      setInsightLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-10 w-10 text-emerald-500 animate-pulse" />
          <div className="text-xl font-bold font-(family-name:--font-playfair) text-white">Loading Intelligence...</div>
        </div>
      </div>
    );
  }

  if (error || articles.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] p-6">
        <div className="flex flex-col items-center text-center max-w-md">
          <Sparkles className="h-12 w-12 text-zinc-600 mb-4" />
          <h1 className="text-3xl font-bold font-(family-name:--font-playfair) text-white mb-2">No active trends</h1>
          <p className="text-zinc-400">Our scraper hasn&apos;t detected enough viral momentum in {dbCategory} right now. Check back in 30 minutes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-(family-name:--font-inter) select-none">
      
      {/* Absolute Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 pointer-events-none flex justify-between items-start">
        <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-emerald-400 font-bold uppercase tracking-widest text-xs pointer-events-auto shadow-2xl">
          {dbCategory} Intelligence
        </div>
        <div className="flex items-center gap-2 px-3 py-1 pb-[6px] rounded-full bg-red-500/20 text-red-400 border border-red-500/10 backdrop-blur-md font-bold text-[10px] uppercase tracking-wider animate-pulse indicator">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5"></div> Live
        </div>
      </div>

      {/* Snap Scrolling Container */}
      <div 
        className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black text-white"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {articles.map((article, idx) => (
          <ArticleSlide 
            key={article.id}
            article={article}
            isLast={idx === articles.length - 1}
            fetchInsight={fetchInsight}
          />
        ))}
      </div>

      {/* AI Insight Overlay */}
      {insightData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setInsightData(null)}>
          <div 
             onClick={(e) => e.stopPropagation()}
             className="w-full max-w-lg bg-[#111] border border-white/20 rounded-3xl p-8 relative shadow-2xl"
          >
             <button 
                onClick={() => setInsightData(null)}
                className="absolute top-4 right-4 rounded-full p-2 bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
             </button>

             <div className="flex items-center gap-2 text-emerald-400 mb-4">
                <Sparkles className="h-6 w-6" />
                <span className="text-sm font-bold tracking-wider uppercase">Strategic Insight</span>
             </div>
             
             <h3 className="text-3xl font-bold text-white mb-6 font-(family-name:--font-playfair) leading-tight">{insightData.title}</h3>
             
             {insightLoading ? (
                <div className="flex flex-col gap-4">
                  <div className="h-4 bg-white/10 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-white/10 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-white/10 rounded animate-pulse w-4/6"></div>
                  <div className="mt-4 flex items-center gap-2 text-emerald-500/50 text-sm font-medium">
                     <Activity className="h-4 w-4 animate-pulse" /> Connecting to global feeds...
                  </div>
                </div>
             ) : (
                <p className="text-zinc-300 text-lg leading-relaxed">
                  {insightData.text}
                </p>
             )}
          </div>
        </div>
      )}

      {/* Inline styles for scrollbar hiding (safari/chrome) */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}

function ArticleSlide({ article, isLast, fetchInsight }: { article: Article, isLast: boolean, fetchInsight: (title: string, e: React.MouseEvent) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [articleImageReady, setArticleImageReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  const articleSpecificImage = article.originalimage_url || article.thumbnail_url || null;
  const categoryFallback = getCategoryFallback(article.category, article.title);
  const visibleImage = (articleImageReady && articleSpecificImage) ? articleSpecificImage : categoryFallback;

  return (
    <div ref={ref} className="relative h-[100dvh] w-full snap-start snap-always shrink-0 flex flex-col justify-end overflow-hidden">

        {/* Hidden preloader for article-specific image */}
        {articleSpecificImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={articleSpecificImage} alt="" aria-hidden="true" className="hidden"
            onLoad={() => setArticleImageReady(true)}
            onError={() => setArticleImageReady(false)}
          />
        )}
        
        {/* Full Screen Hardware Accelerated Image Background with Parallax */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            className="absolute inset-[-15%] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${visibleImage})`, y }}
          />
          {/* Heavy Gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" />
        </div>

        {/* Content Overlay - simplified animation (no scale, just fade+y) for smoothness */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 p-6 pb-24 md:pb-12 md:pl-16 md:pr-24 max-w-4xl flex-1 flex flex-col justify-end pointer-events-none"
        >
          
          <div className="flex items-center gap-2 mb-4 pointer-events-auto">
             <span className="text-white bg-white/20 border border-white/20 backdrop-blur-md px-3 py-1 rounded-sm font-bold text-xs tracking-wider">
               Rank #{article.rank}
             </span>
             <span className="text-zinc-300 text-sm font-medium">
               {article.views.toLocaleString()} views
             </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.1] tracking-tight pointer-events-auto">
            {article.title}
          </h2>
          
          <p className="text-zinc-300 text-lg md:text-xl line-clamp-3 md:line-clamp-4 leading-relaxed max-w-2xl mb-8 pointer-events-auto">
            {article.description || "The global community is currently researching this topic heavily across the Wikipedia network."}
          </p>

          <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
            <button 
              onClick={(e) => fetchInsight(article.title, e)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-full font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="h-5 w-5" /> Why is this viral?
            </button>
            
            <a
              href={article.article_url}
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-bold transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Source <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </a>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        {!isLast && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-bounce">
            <span className="text-xs font-bold tracking-widest uppercase mb-1 drop-shadow-md text-white/70">Swipe</span>
            <ChevronDown className="h-6 w-6 drop-shadow-md text-white/70" />
          </div>
        )}
    </div>
  );
}
