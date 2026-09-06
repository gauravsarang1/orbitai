'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store-context';
import {
  Activity,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function LeftSidebar({
  onViewHistory,
}: {
  onViewHistory?: () => void;
}) {
  const { items } = useAppStore();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const returnedCount = items.filter((i) => i.status === 'RETURNED').length + 12;
  const estimatedValueSaved = returnedCount * 125;

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-4 sm:gap-5 shrink-0">
      {/* Mobile Toggle Trigger */}
      <button
        onClick={() => setMobileExpanded(!mobileExpanded)}
        className="lg:hidden w-full p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 shadow-2xs cursor-pointer min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <span>System Status & Impact Stats</span>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full border border-indigo-200">
            {returnedCount} Saved
          </span>
        </div>
        {mobileExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {/* Content Container - Always visible on lg+, collapsible on mobile */}
      <div className={`space-y-4 sm:space-y-5 ${mobileExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* System Status Box */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              System Status
            </h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">AI Match Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Nodes Scanned</span>
              <span className="font-mono font-bold text-slate-800">14.2k</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Database Sync</span>
                <span>88%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full w-[88%] transition-all" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Cluster:</span>
              <span className="font-mono text-slate-700 font-semibold">east-01-prime</span>
            </div>
          </div>
        </div>

        {/* Your Impact Hero Card */}
        <div className="bg-indigo-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-indigo-100 flex-1 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-300" />
                Community Impact
              </h3>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-indigo-100 font-semibold">
                LIVE
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{returnedCount}</div>
                <div className="text-xs text-indigo-200 font-medium mt-0.5">Items Recovered</div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-300">
                  ${estimatedValueSaved.toLocaleString()}
                </div>
                <div className="text-xs text-indigo-200 font-medium mt-0.5">Asset Value Saved</div>
              </div>
            </div>
          </div>

          <button
            onClick={onViewHistory}
            className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/20 shadow-xs min-h-[42px]"
          >
            View Recovery Analytics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

