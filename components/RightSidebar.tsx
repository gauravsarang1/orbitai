'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store-context';
import { AIMatchResult } from '@/types/lost-and-found';
import {
  Sparkles,
  Eye,
  MessageSquare,
  Compass,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function RightSidebar({
  onSelectMatch,
  onOpenChat,
}: {
  onSelectMatch: (match: AIMatchResult) => void;
  onOpenChat: (convId: string) => void;
}) {
  const { matches, items } = useAppStore();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const topMatches = matches.slice(0, 3);

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4 sm:gap-5 shrink-0">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileExpanded(!mobileExpanded)}
        className="lg:hidden w-full p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 shadow-2xs cursor-pointer min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Smart Match Center & Radar</span>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full border border-indigo-200">
            {matches.length} Alerts
          </span>
        </div>
        {mobileExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {/* Content Container - Collapsible on Mobile, always visible on Desktop */}
      <div className={`space-y-4 sm:space-y-5 ${mobileExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Smart Match Center Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Smart Match Center
              </h3>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {matches.length} Alerts
            </span>
          </div>

          <div className="space-y-3">
            {topMatches.map((m) => {
              const lostItem = items.find((i) => i.id === m.lostItemId);
              const foundItem = items.find((i) => i.id === m.foundItemId);

              return (
                <div
                  key={m.id}
                  className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                      {m.matchScore}% High Confidence
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">2m ago</span>
                  </div>

                  <p className="text-xs text-indigo-900 leading-snug font-medium line-clamp-2">
                    Found &quot;{foundItem?.title || 'Matched Item'}&quot; matches report from {lostItem?.location.venue || 'venue'}.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onOpenChat(`conv_${foundItem?.id || ''}`)}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg font-bold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1 min-h-[36px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat Finder
                    </button>

                    <button
                      onClick={() => onSelectMatch(m)}
                      className="flex-1 py-2 bg-white hover:bg-indigo-100/50 border border-indigo-200 text-indigo-700 text-[11px] rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 min-h-[36px]"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      View Match
                    </button>
                  </div>
                </div>
              );
            })}

            {/* OCR ID Card Detected Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Potential OCR ID Match
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1h ago</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                OCR detected matching student ID name on card reported found in West Wing.
              </p>
            </div>
          </div>
        </div>

        {/* Discovery Hotspots Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col flex-1 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-rose-500" />
              Discovery Hotspots
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Radar Map</span>
          </div>

          <div className="flex-1 min-h-[160px] relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-3 text-white">
            {/* Mock Radar Visual */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-40 h-40 bg-indigo-500/20 rounded-full border border-indigo-400/30 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 bg-indigo-500/20 rounded-full border border-indigo-400/40 flex items-center justify-center">
                  <div className="w-10 h-10 bg-indigo-500/30 rounded-full border border-indigo-300" />
                </div>
              </div>
            </div>

            {/* Active Hotspot Dots */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span className="font-semibold text-slate-200">Main Campus Library</span>
                <span className="text-[10px] text-slate-400 ml-auto">8 reports</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="font-semibold text-slate-200">Station Square Hub</span>
                <span className="text-[10px] text-slate-400 ml-auto">5 reports</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-200">Terminal 2 Food Court</span>
                <span className="text-[10px] text-slate-400 ml-auto">3 reports</span>
              </div>
            </div>

            <div className="relative z-10 bg-slate-800/90 backdrop-blur-md p-2 rounded-lg text-[10px] font-medium text-slate-300 border border-slate-700/80 flex items-center justify-between">
              <span>Activity Density:</span>
              <span className="text-indigo-300 font-bold uppercase tracking-wider">HIGH (LIVE)</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

