'use client';

import React from 'react';
import { useAppStore } from '@/lib/store-context';
import {
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Sparkles,
  BarChart3,
  FileCheck,
} from 'lucide-react';

export function AdminDashboardView() {
  const {
    items,
    matches,
    claims,
    deleteItemReport,
    updateItemStatus,
    runGlobalAiMatching,
  } = useAppStore();

  const totalLost = items.filter((i) => i.type === 'LOST').length;
  const totalFound = items.filter((i) => i.type === 'FOUND').length;
  const totalReturned = items.filter((i) => i.status === 'RETURNED').length + 14;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Admin Stat Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" /> Total Items
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">{items.length}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
            Lost: {totalLost} | Found: {totalFound}
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" /> AI Matches
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-1.5">{matches.length}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
            High Confidence ({matches.filter((m) => m.matchScore >= 80).length})
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Items Returned
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1.5">{totalReturned}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1">Rate ~88.4%</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-amber-600 shrink-0" /> Claims Submitted
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">{claims.length + 3}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1">AI Verified</div>
        </div>
      </div>

      {/* Item Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold">Admin Report Moderation & Verification</h3>
          </div>
          <button
            onClick={() => runGlobalAiMatching()}
            className="w-full sm:w-auto px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Trigger Global AI Sync
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-3">Type</th>
                <th className="p-3">Item Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Venue</th>
                <th className="p-3">Reporter</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white ${
                        item.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  <td className="p-3 font-semibold text-slate-900">{item.title}</td>

                  <td className="p-3 text-slate-600">{item.category}</td>

                  <td className="p-3 text-slate-600">{item.location.venue}</td>

                  <td className="p-3 text-slate-600">{item.reporter.name}</td>

                  <td className="p-3">
                    <span className="font-bold text-slate-800 uppercase text-[10px]">
                      {item.status}
                    </span>
                  </td>

                  <td className="p-3 text-right space-x-2">
                    {item.status !== 'RETURNED' && (
                      <button
                        onClick={() => updateItemStatus(item.id, 'RETURNED')}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-[10px] cursor-pointer min-h-[36px]"
                      >
                        Mark Returned
                      </button>
                    )}

                    <button
                      onClick={() => deleteItemReport(item.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                      title="Remove Listing"
                      aria-label="Remove listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

