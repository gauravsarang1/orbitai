'use client';

import React, { useState } from 'react';
import { AppStoreProvider, useAppStore } from '@/lib/store-context';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { FilterBar } from '@/components/FilterBar';
import { ItemCard } from '@/components/ItemCard';
import { LeftSidebar } from '@/components/LeftSidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { FooterStatusBar } from '@/components/FooterStatusBar';
import { ItemDetailDrawer } from '@/components/ItemDetailDrawer';
import { AIMatchModal } from '@/components/AIMatchModal';
import { ReportItemModal } from '@/components/ReportItemModal';
import { VisualSearchModal } from '@/components/VisualSearchModal';
import { ClaimVerificationModal } from '@/components/ClaimVerificationModal';
import { SecureChatModal } from '@/components/SecureChatModal';
import { QRCodeModal } from '@/components/QRCodeModal';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { AIMatchResult } from '@/types/lost-and-found';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  HelpCircle,
  AlertTriangle,
  QrCode,
  ShieldAlert,
} from 'lucide-react';

function AppContent() {
  const {
    items,
    matches,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedVenue,
    currentUser,
    setSelectedItemDetail,
    setClaimModalItem,
    setActiveChatConvId,
    setReportModalOpen,
    setReportType,
    setQrModalItem,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<
    'ALL' | 'LOST' | 'FOUND' | 'AI_MATCHES' | 'MY_ITEMS' | 'ADMIN_AUDIT'
  >('ALL');

  const [selectedMatch, setSelectedMatch] = useState<AIMatchResult | null>(null);

  // Filter Items
  const filteredItems = items.filter((item) => {
    // Tab filter
    if (activeTab === 'LOST' && item.type !== 'LOST') return false;
    if (activeTab === 'FOUND' && item.type !== 'FOUND') return false;
    if (
      activeTab === 'MY_ITEMS' &&
      (!currentUser || item.reporter.userId !== currentUser.id)
    )
      return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.venue.toLowerCase().includes(q) ||
        (item.ocrText && item.ocrText.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q));

      if (!matchText) return false;
    }

    // Category filter
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory)
      return false;

    // Status filter
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

    // Venue filter
    if (selectedVenue !== 'ALL' && item.location?.venue !== selectedVenue)
      return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Top Hero Banner */}
        <HeroBanner />

        {/* 3-Column Sleek Interface Grid Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left System & Community Impact Sidebar */}
          <LeftSidebar onViewHistory={() => setActiveTab('MY_ITEMS')} />

          {/* Central Main Application Hub */}
          <section className="flex-1 w-full space-y-6 min-w-0">
            {/* Quick Action Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Report Lost Item Tile */}
              <button
                onClick={() => {
                  setReportType('LOST');
                  setReportModalOpen(true);
                }}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all text-left flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    Report Lost Item
                  </div>
                  <div className="text-[11px] text-slate-500">File a missing item alert</div>
                </div>
              </button>

              {/* Report Found Item Tile */}
              <button
                onClick={() => {
                  setReportType('FOUND');
                  setReportModalOpen(true);
                }}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Report Found Item
                  </div>
                  <div className="text-[11px] text-slate-500">Log an item you picked up</div>
                </div>
              </button>

              {/* Smart QR Asset Tagging Tile */}
              <button
                onClick={() => {
                  if (items.length > 0) {
                    setQrModalItem(items[0]);
                  }
                }}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Generate Smart QR Tag
                  </div>
                  <div className="text-[11px] text-slate-500">Print asset security code</div>
                </div>
              </button>
            </div>

            {/* Filters & View Tabs */}
            <FilterBar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content Display */}
            {activeTab === 'ADMIN_AUDIT' ? (
              <AdminDashboardView />
            ) : activeTab === 'AI_MATCHES' ? (
              /* AI Matches Queue View */
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-4 rounded-2xl">
                  <div>
                    <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                      AI Suggested Lost & Found Matches
                    </h2>
                    <p className="text-xs text-indigo-800">
                      Cross-matched using Gemini Vision, OCR Text, and Venue Coincidence
                    </p>
                  </div>

                  <span className="text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1 rounded-full">
                    {matches.length} Total Pairings
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((m) => {
                    const lostItem = items.find((i) => i.id === m.lostItemId);
                    const foundItem = items.find((i) => i.id === m.foundItemId);

                    if (!lostItem || !foundItem) return null;

                    return (
                      <div
                        key={m.id}
                        className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full">
                              {m.matchScore}% MATCH
                            </span>
                            <span className="text-xs font-bold text-indigo-900 uppercase">
                              {m.overallVerdict.replace('_', ' ')}
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedMatch(m)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            Deep AI Breakdown <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Pair Preview */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-rose-700 uppercase block">
                              Lost: {lostItem.title}
                            </span>
                            <div className="text-slate-600 line-clamp-1">{lostItem.location.venue}</div>
                          </div>

                          <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                              Found: {foundItem.title}
                            </span>
                            <div className="text-slate-600 line-clamp-1">{foundItem.location.venue}</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {m.aiReasoning}
                        </p>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <button
                            onClick={() => setSelectedMatch(m)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            View Side-By-Side
                          </button>

                          <button
                            onClick={() => setClaimModalItem(foundItem)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Verify & Claim
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Item Cards Grid */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    Showing {filteredItems.length} Reported Items
                  </h2>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setReportType('LOST');
                        setReportModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Report Lost
                    </button>

                    <button
                      onClick={() => {
                        setReportType('FOUND');
                        setReportModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Report Found
                    </button>
                  </div>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No items match your criteria</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try adjusting search keywords, resetting category filters, or reporting a new lost or found item.
                    </p>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-1 xl:grid-cols-2 gap-5">
                    {filteredItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onSelectMatch={(m) => setSelectedMatch(m)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Right Smart Match & Hotspots Sidebar */}
          <RightSidebar
            onSelectMatch={(m) => setSelectedMatch(m)}
            onOpenChat={(convId) => setActiveChatConvId(convId)}
          />
        </div>
      </main>

      {/* Footer System Status Bar */}
      <FooterStatusBar />

      {/* Global Modals & Drawers */}
      <ItemDetailDrawer onSelectMatch={(m) => setSelectedMatch(m)} />
      {selectedMatch && (
        <AIMatchModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
      <ReportItemModal />
      <VisualSearchModal />
      <ClaimVerificationModal />
      <SecureChatModal />
      <QRCodeModal />
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}

