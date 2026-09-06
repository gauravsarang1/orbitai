'use client';

import React from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store-context';
import { AIMatchResult } from '@/types/lost-and-found';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  QrCode,
  FileText,
  ShieldCheck,
  Gift,
  HelpCircle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export function ItemDetailDrawer({
  onSelectMatch,
}: {
  onSelectMatch: (match: AIMatchResult) => void;
}) {
  const {
    selectedItemDetail,
    setSelectedItemDetail,
    setQrModalItem,
    setClaimModalItem,
    setActiveChatConvId,
    matches,
    items,
  } = useAppStore();

  if (!selectedItemDetail) return null;

  const item = selectedItemDetail;

  // Find matches involving this item
  const itemMatches = matches.filter(
    (m) => m.lostItemId === item.id || m.foundItemId === item.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end p-0 sm:p-4 transition-opacity animate-fadeIn">
      <div className="bg-white w-full sm:max-w-xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                item.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {item.type}
            </span>
            <span className="text-xs text-slate-300 font-semibold">{item.category}</span>
          </div>

          <button
            onClick={() => setSelectedItemDetail(null)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close detail panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
          {/* Main Title & Reward */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {item.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {item.type === 'LOST' ? 'Lost on' : 'Found on'}:{' '}
                  <strong className="text-slate-800">
                    {new Date(item.dateOccurred).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </strong>
                </span>
              </div>
            </div>

            {item.rewardAmount && item.rewardAmount > 0 && (
              <div className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1 self-start shrink-0">
                <Gift className="w-4 h-4 text-amber-600" />
                ${item.rewardAmount} Reward
              </div>
            )}
          </div>

          {/* Photo Gallery */}
          {item.images && item.images.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-52 sm:h-64 relative">
              <Image
                src={item.images[0]}
                alt={item.title}
                fill
                unoptimized
                referrerPolicy="no-referrer"
                className="object-cover"
              />
              <button
                onClick={() => setQrModalItem(item)}
                className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md border border-white/20 cursor-pointer min-h-[38px] z-10"
              >
                <QrCode className="w-4 h-4" />
                View QR Tag
              </button>
            </div>
          )}

          {/* Location & Custody Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-start gap-2 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">{item.location.venue}</div>
                <div className="text-slate-600">{item.location.areaDetail}</div>
                {item.location.city && <div className="text-slate-500 text-[11px]">{item.location.city}</div>}
              </div>
            </div>

            {item.custodyLocation && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Safe Custody Location: {item.custodyLocation}
              </div>
            )}
          </div>

          {/* Description & Attributes */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Item Description & Attributes
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
              {item.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] font-medium">Primary Color</span>
                <span className="font-bold text-slate-800">{item.primaryColor}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] font-medium">Brand / Make</span>
                <span className="font-bold text-slate-800">{item.brand || 'Unspecified'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] font-medium">Report Status</span>
                <span className="font-bold text-indigo-700 uppercase">{item.status}</span>
              </div>
            </div>
          </div>

          {/* OCR Extracted Document Text */}
          {item.ocrText && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                AI OCR Extracted Text (Document/ID)
              </div>
              <p className="text-xs text-amber-800 font-mono bg-white p-2.5 rounded-lg border border-amber-200 break-words">
                &quot;{item.ocrText}&quot;
              </p>
            </div>
          )}

          {/* AI Verification Questions */}
          {item.verificationQuestions && item.verificationQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                AI Generated Verification Questions
              </div>
              <div className="space-y-1.5">
                {item.verificationQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-medium leading-normal"
                  >
                    Q{idx + 1}: {q}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Matches Section */}
          {itemMatches.length > 0 && (
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />
                  AI Candidate Matches ({itemMatches.length})
                </div>
              </div>

              {itemMatches.map((m) => {
                const oppositeId =
                  m.lostItemId === item.id ? m.foundItemId : m.lostItemId;
                const oppositeItem = items.find((i) => i.id === oppositeId);

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMatch(m)}
                    className="p-3 bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[44px]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-indigo-950">
                          {oppositeItem?.title || 'Matched Item'}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {m.matchScore}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        {m.aiReasoning}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Reporter Profile */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src={item.reporter.avatar}
                alt={item.reporter.name}
                fill
                unoptimized
                referrerPolicy="no-referrer"
                className="rounded-full object-cover ring-2 ring-slate-200"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{item.reporter.name}</div>
              <div className="text-[11px] text-slate-500">Reported as {item.reporter.role}</div>
            </div>
          </div>
        </div>

        {/* Footer Bar Actions - Mobile Touch Friendly */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={() => setQrModalItem(item)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Asset</span> Tag
          </button>

          {item.type === 'FOUND' && item.status !== 'RETURNED' && (
            <button
              onClick={() => {
                setSelectedItemDetail(null);
                setClaimModalItem(item);
              }}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              Claim Ownership
            </button>
          )}

          {item.status === 'CLAIMED' && (
            <button
              onClick={() => {
                setSelectedItemDetail(null);
                setActiveChatConvId(`conv_${item.id}`);
              }}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4" />
              Open Secure Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

