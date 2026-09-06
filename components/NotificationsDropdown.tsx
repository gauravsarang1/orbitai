'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store-context';
import { CheckCheck, Bell, ArrowRight, X } from 'lucide-react';

export function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const {
    notifications,
    currentUser,
    markNotificationRead,
    markAllNotificationsRead,
    items,
    setSelectedItemDetail,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const myNotifs = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id)
    : notifications;

  if (!mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-end sm:justify-start pointer-events-none">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity pointer-events-auto"
        onClick={onClose}
      />

      {/* Panel Container */}
      <div className="relative w-full h-full sm:h-auto sm:w-96 sm:max-h-[85vh] sm:mt-16 sm:mr-6 sm:ml-auto bg-white sm:border sm:border-slate-200 sm:rounded-2xl shadow-2xl z-[10000] flex flex-col overflow-hidden animate-fadeIn pointer-events-auto">
        {/* Panel Header */}
        <div className="p-3.5 sm:p-3 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
            <span className="text-sm sm:text-xs font-bold">Notifications</span>
            {myNotifs.some((n) => !n.read) && (
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                {myNotifs.filter((n) => !n.read).length} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {myNotifs.some((n) => !n.read) && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs sm:text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer min-h-[36px] px-2 py-1 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
          {myNotifs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs sm:text-xs flex flex-col items-center justify-center h-48">
              <Bell className="w-8 h-8 text-slate-300 mb-2" />
              <span>No notifications right now.</span>
            </div>
          ) : (
            myNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.relatedItemId) {
                    const item = items.find((i) => i.id === n.relatedItemId);
                    if (item) setSelectedItemDetail(item);
                  }
                  onClose();
                }}
                className={`p-3.5 sm:p-3 text-left transition-colors cursor-pointer hover:bg-slate-100/80 active:bg-slate-100 ${
                  !n.read ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">{n.message}</p>
                {n.relatedItemId && (
                  <div className="mt-2.5 flex items-center text-[11px] font-semibold text-indigo-600">
                    View item report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

