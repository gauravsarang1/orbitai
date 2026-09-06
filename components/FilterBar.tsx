'use client';

import React from 'react';
import { useAppStore } from '@/lib/store-context';
import { ItemCategory, ItemStatus } from '@/types/lost-and-found';
import {
  Layers,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle,
  UserCheck,
  RotateCcw,
} from 'lucide-react';

const CATEGORIES: { label: string; value: ItemCategory | 'ALL'; icon: string }[] = [
  { label: 'All Categories', value: 'ALL', icon: '✨' },
  { label: 'Electronics', value: 'Electronics', icon: '📱' },
  { label: 'Wallets & Bags', value: 'Wallets & Bags', icon: '💼' },
  { label: 'ID Cards & Docs', value: 'ID Cards & Documents', icon: '💳' },
  { label: 'Keys', value: 'Keys', icon: '🔑' },
  { label: 'Jewelry & Watches', value: 'Jewelry & Watches', icon: '⌚' },
  { label: 'Clothing', value: 'Clothing & Accessories', icon: '🕶️' },
  { label: 'Pets', value: 'Pets', icon: '🐾' },
  { label: 'Books & Stationery', value: 'Books & Stationery', icon: '📚' },
  { label: 'Other', value: 'Other', icon: '📦' },
];

export function FilterBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: 'ALL' | 'LOST' | 'FOUND' | 'AI_MATCHES' | 'MY_ITEMS' | 'ADMIN_AUDIT';
  setActiveTab: (tab: 'ALL' | 'LOST' | 'FOUND' | 'AI_MATCHES' | 'MY_ITEMS' | 'ADMIN_AUDIT') => void;
}) {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedVenue,
    setSelectedVenue,
    items,
    matches,
    currentUser,
  } = useAppStore();

  // Extract unique venues
  const venues = Array.from(
    new Set(items.map((i) => i.location?.venue).filter(Boolean))
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 mb-6 shadow-xs space-y-4 w-full">
      {/* Top View Tabs - Touch Scrollable */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar -mx-1 px-1">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px] shrink-0 ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          All Reports ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('LOST')}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px] shrink-0 ${
            activeTab === 'LOST'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          Lost ({items.filter((i) => i.type === 'LOST').length})
        </button>

        <button
          onClick={() => setActiveTab('FOUND')}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px] shrink-0 ${
            activeTab === 'FOUND'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          Found ({items.filter((i) => i.type === 'FOUND').length})
        </button>

        <button
          onClick={() => setActiveTab('AI_MATCHES')}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px] shrink-0 ${
            activeTab === 'AI_MATCHES'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
          AI Matches ({matches.length})
        </button>

        <button
          onClick={() => setActiveTab('MY_ITEMS')}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px] shrink-0 ${
            activeTab === 'MY_ITEMS'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-700 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          My Items ({currentUser ? items.filter((i) => i.reporter.userId === currentUser.id).length : 0})
        </button>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('ADMIN_AUDIT')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px] shrink-0 ${
              activeTab === 'ADMIN_AUDIT'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <Filter className="w-4 h-4 shrink-0" />
            Admin Panel
          </button>
        )}
      </div>

      {/* Category Pills - Touch Friendly Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border min-h-[38px] shrink-0 ${
              selectedCategory === cat.value
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Dropdown Filter Controls - Stacked on Mobile, Flex on Desktop */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {/* Venue Location Filter */}
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl min-h-[42px]">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-500 font-medium shrink-0">Venue:</span>
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="w-full bg-transparent font-semibold text-slate-800 text-base sm:text-xs focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Locations</option>
            {venues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl min-h-[42px]">
          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-500 font-medium shrink-0">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ItemStatus | 'ALL')}
            className="w-full bg-transparent font-semibold text-slate-800 text-base sm:text-xs focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_MATCH">Pending Match</option>
            <option value="CLAIMED">Claimed</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>

        {/* Reset Filters */}
        {(selectedCategory !== 'ALL' || selectedVenue !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedVenue('ALL');
              setSelectedStatus('ALL');
            }}
            className="px-3 py-2 text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}

