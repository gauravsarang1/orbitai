'use client';

import React from 'react';
import { Cpu, Server, ShieldCheck, Sparkles } from 'lucide-react';

export function FooterStatusBar() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
      {/* Left system nodes */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Server className="w-3.5 h-3.5 text-indigo-600" />
          <span>Server Cluster:</span>
          <span className="font-mono text-slate-900 font-bold">east-01-prime</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-600">
          <Cpu className="w-3.5 h-3.5 text-sky-600" />
          <span>Vision Processor:</span>
          <span className="font-mono text-slate-900 font-bold">t-model-v4</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold">
          <ShieldCheck className="w-3 h-3" /> Encrypted Vault Active
        </div>
      </div>

      {/* Right Copyright & Version */}
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Orbit AI Engine v3.6
        </span>
        <span>•</span>
        <span>© 2026 LOST&FOUND AI SYSTEMS</span>
      </div>
    </footer>
  );
}
