'use client';

import React from 'react';
import Image from 'next/image';
import { AIMatchResult } from '@/types/lost-and-found';
import { useAppStore } from '@/lib/store-context';
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
  Eye,
  Tag,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export function AIMatchModal({
  match,
  onClose,
}: {
  match: AIMatchResult;
  onClose: () => void;
}) {
  const { items, setClaimModalItem, setActiveChatConvId } = useAppStore();

  const lostItem = items.find((i) => i.id === match.lostItemId);
  const foundItem = items.find((i) => i.id === match.foundItemId);

  if (!lostItem || !foundItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5 text-sky-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                AI Cross-Match Analysis
              </h2>
              <p className="text-[11px] text-slate-400">
                Multimodal Image, Text OCR, & Location Evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 bg-slate-50">
          {/* Match Score Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-indigo-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 sm:gap-4 w-full">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 border-4 border-indigo-500 flex flex-col items-center justify-center shrink-0 shadow-inner">
                <span className="text-xl sm:text-2xl font-black text-emerald-300 leading-none">
                  {match.matchScore}%
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase mt-0.5">
                  Match
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {match.overallVerdict.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {match.aiReasoning}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                setClaimModalItem(foundItem);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Claim & Verify Ownership
            </button>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lost Item Card */}
            <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-full uppercase">
                  LOST ITEM REPORT
                </span>
                <span className="text-xs text-slate-500">{lostItem.category}</span>
              </div>

              {lostItem.images && lostItem.images[0] && (
                <div className="relative h-36 sm:h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <Image
                    src={lostItem.images[0]}
                    alt={lostItem.title}
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
              )}

              <h3 className="font-bold text-slate-900 text-sm">{lostItem.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{lostItem.description}</p>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="line-clamp-1">{lostItem.location.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{new Date(lostItem.dateOccurred).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Found Item Card */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase">
                  FOUND ITEM REPORT
                </span>
                <span className="text-xs text-slate-500">{foundItem.category}</span>
              </div>

              {foundItem.images && foundItem.images[0] && (
                <div className="relative h-36 sm:h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <Image
                    src={foundItem.images[0]}
                    alt={foundItem.title}
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
              )}

              <h3 className="font-bold text-slate-900 text-sm">{foundItem.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{foundItem.description}</p>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="line-clamp-1">{foundItem.location.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="line-clamp-1">Custody: {foundItem.custodyLocation || 'Under Security Hold'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Metrics Grid */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              AI Evaluation Metrics Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Visual Similarity */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-indigo-600 shrink-0" /> Visual Image Match
                  </span>
                  <span className="text-xs font-black text-indigo-600">
                    {match.visualSimilarityScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${match.visualSimilarityScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {match.breakdown?.visualDetails}
                </p>
              </div>

              {/* Text & OCR Match */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" /> Text & OCR Match
                  </span>
                  <span className="text-xs font-black text-amber-600">
                    {match.textSimilarityScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${match.textSimilarityScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {match.breakdown?.textOcrDetails}
                </p>
              </div>

              {/* Location & Time Coincidence */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" /> Location & Time Proximity
                  </span>
                  <span className="text-xs font-black text-rose-600">
                    {match.locationScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${match.locationScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {match.breakdown?.locationTimeDetails}
                </p>
              </div>

              {/* Color & Attributes */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0" /> Color & Brand Alignment
                  </span>
                  <span className="text-xs font-black text-emerald-600">
                    {match.colorScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${match.colorScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {match.breakdown?.colorAttributeDetails}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={() => {
              onClose();
              setActiveChatConvId(`conv_${lostItem.id}`);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4" />
            Open Secure Chat
          </button>

          <button
            onClick={() => {
              onClose();
              setClaimModalItem(foundItem);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            Proceed to Verification Claim
          </button>
        </div>
      </div>
    </div>
  );
}

