'use client';

import React from 'react';
import Image from 'next/image';
import { ItemReport, AIMatchResult } from '@/types/lost-and-found';
import { useAppStore } from '@/lib/store-context';
import {
  MapPin,
  Calendar,
  Sparkles,
  QrCode,
  FileText,
  Gift,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export function ItemCard({
  item,
  onSelectMatch,
}: {
  item: ItemReport;
  onSelectMatch?: (match: AIMatchResult) => void;
}) {
  const {
    setSelectedItemDetail,
    setQrModalItem,
    setClaimModalItem,
    matches,
    currentUser,
    setActiveChatConvId,
  } = useAppStore();

  // Find top AI match for this item if available
  const itemMatch = matches.find(
    (m) =>
      (m.lostItemId === item.id || m.foundItemId === item.id) &&
      m.matchScore >= 60
  );

  return (
    <article className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative w-full min-w-0">
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-[5/4] bg-slate-100 overflow-hidden shrink-0">
        {item.images && item.images.length > 0 ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            unoptimized
            referrerPolicy="no-referrer"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold bg-slate-50">
            No Image Uploaded
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/45 to-transparent pointer-events-none" />

        {/* Type Badge (LOST / FOUND) */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center gap-1.5 pr-20">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide text-white uppercase shadow-xs ${
              item.type === 'LOST'
                ? 'bg-rose-600'
                : 'bg-emerald-600'
            }`}
          >
            {item.type === 'LOST' ? 'LOST ITEM' : 'FOUND ITEM'}
          </span>

          <span className="max-w-full truncate px-2 py-1 rounded-full text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
            {item.category}
          </span>
        </div>

        {/* Reward Badge */}
        {item.rewardAmount && item.rewardAmount > 0 ? (
          <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-extrabold text-[11px] sm:text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 shrink-0" /> ${item.rewardAmount} REWARD
          </div>
        ) : null}

        {/* AI Confidence Match Badge */}
        {itemMatch && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectMatch) onSelectMatch(itemMatch);
            }}
            className="absolute bottom-2.5 left-2.5 right-2.5 bg-indigo-950/95 text-white backdrop-blur-md p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border border-indigo-400/40 shadow-lg cursor-pointer transition-transform active:scale-[0.98] hover:bg-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            aria-label={`View AI match scored ${itemMatch.matchScore}%`}
          >
            <div className="flex items-center gap-2 truncate pr-1">
              <Sparkles className="w-4 h-4 text-sky-300 animate-pulse shrink-0" />
              <span className="truncate">AI Match: <strong className="text-emerald-300">{itemMatch.matchScore}%</strong></span>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-300 shrink-0" />
          </button>
        )}
      </div>

      {/* Body Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Status & Date */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-slate-500 mb-2">
            <span className="flex min-w-0 items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{new Date(item.dateOccurred).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}</span>
            </span>

            <span
              className={`shrink-0 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                item.status === 'RETURNED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : item.status === 'CLAIMED'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {item.status}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => setSelectedItemDetail(item)}
            className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.5rem] hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {item.title}
          </h3>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2 font-medium leading-snug">
              {item.location.venue} {item.location.areaDetail ? `(${item.location.areaDetail})` : ''}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* OCR Extracted Text Badge */}
          {item.ocrText && (
            <div className="mt-2.5 p-2 bg-amber-50/80 border border-amber-200/80 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="line-clamp-1 font-mono font-medium">
                OCR: &quot;{item.ocrText}&quot;
              </span>
            </div>
          )}

          {/* AI Tags */}
          {item.aiTags && item.aiTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {item.aiTags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions - Touch Friendly Min Heights */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
          {/* QR Code Tag Button */}
          <button
            onClick={() => setQrModalItem(item)}
            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            title="View QR Asset Tag"
            aria-label="View QR asset tag"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Action Buttons */}
          <div className="flex flex-1 items-center justify-end gap-2 flex-wrap">
            <button
              onClick={() => setSelectedItemDetail(item)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer min-h-[40px] flex-1 sm:flex-none flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Details
            </button>

            {item.type === 'FOUND' && item.status !== 'RETURNED' && (
              <button
                onClick={() => setClaimModalItem(item)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Claim Item
              </button>
            )}

            {item.status === 'CLAIMED' && (
              <button
                onClick={() => setActiveChatConvId(`conv_${item.id}`)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

