'use client';

import React from 'react';
import { useAppStore } from '@/lib/store-context';
import { Sparkles, Search, CheckCircle2, Clock, Zap } from 'lucide-react';

export function HeroBanner() {
  const {
    items,
    searchQuery,
    setSearchQuery,
    setVisualSearchModalOpen,
  } = useAppStore();

  const returnedCount = items.filter((i) => i.status === 'RETURNED').length + 14;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 mb-6 sm:mb-8 border border-slate-800 shadow-xl relative overflow-hidden w-full">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-sky-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Multimodal Gemini 3.6 AI Engine</span>
        </div>

        {/* Main Title */}
        <h1 className="text-xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-tight">
          Recover Lost Belongings in Minutes with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-300">Artificial Intelligence</span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto mb-6 sm:mb-8 font-normal leading-relaxed px-1">
          Smart item matching combining computer vision, OCR document reading, NLP descriptions, and venue location alignment across campuses & venues.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search e.g. 'Blue Wallet', 'iPhone 15', 'Toyota Key'..."
              className="w-full bg-slate-900/70 text-white placeholder-slate-400 text-base sm:text-sm pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-white/10 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 min-h-[44px]"
            />
          </div>
          <button
            onClick={() => setVisualSearchModalOpen(true)}
            className="w-full sm:w-auto px-4 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px] shrink-0"
          >
            <Sparkles className="w-4 h-4 text-sky-300 shrink-0" />
            <span>Visual Image Search</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-800/80 text-left max-w-3xl mx-auto">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-slate-400 text-[10px] sm:text-[11px] font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Total Active
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-0.5">{items.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-slate-400 text-[10px] sm:text-[11px] font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> AI Confidence
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">96.4%</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-slate-400 text-[10px] sm:text-[11px] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Recovered
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-0.5">{returnedCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-slate-400 text-[10px] sm:text-[11px] font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" /> Avg Time
            </div>
            <div className="text-lg sm:text-xl font-bold text-sky-300 mt-0.5">4.2 Hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}

