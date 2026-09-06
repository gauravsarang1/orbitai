'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store-context';
import {
  X,
  Upload,
  Sparkles,
  ArrowRight,
  Loader2,
  MapPin,
} from 'lucide-react';

export function VisualSearchModal() {
  const {
    visualSearchModalOpen,
    setVisualSearchModalOpen,
    items,
    setSelectedItemDetail,
  } = useAppStore();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    detectedFeatures?: string;
    matches?: Array<{
      itemId: string;
      similarityScore: number;
      matchReasoning: string;
    }>;
  } | null>(null);

  if (!visualSearchModalOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setSearchResults(null);
        performVisualSearch(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const performVisualSearch = async (base64Img: string) => {
    setSearching(true);
    try {
      const res = await fetch('/api/gemini/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          itemsList: items,
          searchType: 'VISUAL_SEARCH',
        }),
      });

      const data = await res.json();
      if (data.success && data.visualSearchResults) {
        setSearchResults(data.visualSearchResults);
      }
    } catch (e) {
      console.error('Visual search error:', e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-3xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5 text-sky-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">AI Visual Photo Search</h2>
              <p className="text-[11px] text-slate-400">
                Upload or take a photo to find matching items automatically
              </p>
            </div>
          </div>

          <button
            onClick={() => setVisualSearchModalOpen(false)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {/* Upload Area */}
          <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-center transition-colors">
            <input
              type="file"
              accept="image/*"
              id="visual-search-file"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="visual-search-file"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2.5 py-2 min-h-[120px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                Tap to upload or take a photo
              </div>
              <div className="text-[11px] text-slate-500 max-w-sm">
                Gemini 3.6 Vision analyzes shape, color, brand, and text in real-time
              </div>
            </label>
          </div>

          {/* Uploaded Image Preview & Scanning Status */}
          {imagePreview && (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <Image
                  src={imagePreview}
                  alt="Search input"
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-left w-full">
                {searching ? (
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                    Analyzing image features & querying database...
                  </div>
                ) : searchResults?.detectedFeatures ? (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> AI Detected Features:
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-normal">
                      {searchResults.detectedFeatures}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Search Results List */}
          {searchResults?.matches && searchResults.matches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Top AI Visual Matches Found ({searchResults.matches.length})
              </h3>

              <div className="space-y-3">
                {searchResults.matches.map((m) => {
                  const targetItem = items.find((i) => i.id === m.itemId);
                  if (!targetItem) return null;

                  return (
                    <div
                      key={m.itemId}
                      onClick={() => {
                        setVisualSearchModalOpen(false);
                        setSelectedItemDetail(targetItem);
                      }}
                      className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-h-[44px]"
                    >
                      <div className="flex items-center gap-3">
                        {targetItem.images && targetItem.images[0] && (
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={targetItem.images[0]}
                              alt={targetItem.title}
                              fill
                              unoptimized
                              referrerPolicy="no-referrer"
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white shrink-0 ${
                                targetItem.type === 'LOST'
                                  ? 'bg-rose-600'
                                  : 'bg-emerald-600'
                              }`}
                            >
                              {targetItem.type}
                            </span>
                            <span className="font-bold text-xs text-slate-900 line-clamp-1">
                              {targetItem.title}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="line-clamp-1">{targetItem.location.venue}</span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                            {m.matchReasoning}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          {m.similarityScore}% Visual Match
                        </span>
                        <div className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1">
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {searchResults?.matches && searchResults.matches.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
              No direct visual matches with confidence &gt; 30% found in the database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

