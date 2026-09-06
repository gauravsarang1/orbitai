'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store-context';
import {
  X,
  Send,
  ShieldCheck,
  MapPin,
  PartyPopper,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function SecureChatModal() {
  const {
    activeChatConvId,
    setActiveChatConvId,
    messages,
    sendMessage,
    currentUser,
    items,
    updateItemStatus,
  } = useAppStore();

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const convMessages = activeChatConvId ? messages[activeChatConvId] || [] : [];

  // Extract related item ID from conversation ID (e.g. conv_item_101)
  const itemId = activeChatConvId ? activeChatConvId.replace('conv_', '') : '';
  const item = items.find((i) => i.id === itemId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length]);

  if (!activeChatConvId) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(activeChatConvId, input);
    setInput('');
  };

  const handleMarkReturned = () => {
    if (item) {
      updateItemStatus(item.id, 'RETURNED');
      sendMessage(
        activeChatConvId,
        '🎉 ITEM RETURN CONFIRMED! Item has been successfully returned to owner. Thank you for using Orbit AI!'
      );
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl h-full sm:h-[85vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                  {item ? item.title : 'Secure Lost & Found Chat'}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 shrink-0">
                  ENCRYPTED
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Verified Handover Zone • Privacy Protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {item && item.status !== 'RETURNED' && (
              <button
                onClick={handleMarkReturned}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer min-h-[36px]"
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Confirm Return</span>
              </button>
            )}

            <button
              onClick={() => setActiveChatConvId(null)}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safe Custody Banner */}
        {item?.custodyLocation && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-1 shrink-0">
            <span className="flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Custody:{' '}
              <strong className="text-emerald-950">{item.custodyLocation}</strong>
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">
              Venue: {item.location.venue}
            </span>
          </div>
        )}

        {/* Message Thread */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50">
          {convMessages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 font-medium text-center max-w-lg mx-auto shadow-2xs leading-relaxed"
                >
                  {msg.text}
                </div>
              );
            }

            const isMe = currentUser ? msg.senderId === currentUser.id : false;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-400 mb-1 px-1">
                  {msg.senderName} ({msg.senderRole})
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                <div className="text-[9px] text-slate-400 mt-0.5 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message to schedule pickup..."
            className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
          />
          <button
            type="submit"
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0 min-w-[44px] min-h-[44px]"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

