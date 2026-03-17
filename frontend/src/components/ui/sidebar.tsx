"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Globe, 
  TrendingUp, 
  ShieldAlert, 
  Plane, 
  Film, 
  Microscope 
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Live Dashboard", href: "/dashboard", icon: Home },
    { name: "Geopolitics", href: "/explore/geopolitics", icon: Globe },
    { name: "Trade & Tariffs", href: "/explore/tradeandtariffs", icon: TrendingUp },
    { name: "Security & Terror", href: "/explore/securityandterrorism", icon: ShieldAlert },
    { name: "Global Tourism", href: "/explore/globaltourism", icon: Plane },
    { name: "Entertainment", href: "/explore/entertainment", icon: Film },
    { name: "Science", href: "/explore/science", icon: Microscope },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-[#0a0a0a] min-h-screen p-6 shrink-0 sticky top-0 h-screen overflow-y-auto z-40">
      <div className="mb-10 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Globe className="h-5 w-5 text-black" />
        </div>
        <span className="text-xl font-bold font-(family-name:--font-playfair) tracking-wide text-white">Hub</span>
      </div>

      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Discovery</div>
      
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname.includes(link.href);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? "bg-white/10 text-emerald-400 font-bold" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-emerald-400" : "opacity-70"}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-8 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 opacity-60">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-white uppercase tracking-wider">Agent Online</span>
        </div>
      </div>
    </div>
  );
}
