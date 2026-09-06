'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store-context';
import { X, QrCode, Download, Sparkles, Printer } from 'lucide-react';
import QRCode from 'qrcode';

export function QRCodeModal() {
  const { qrModalItem, setQrModalItem } = useAppStore();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (qrModalItem) {
      const targetUrl = typeof window !== 'undefined'
        ? `${window.location.origin}?qr=${qrModalItem.qrCodeId || qrModalItem.id}`
        : `https://lostandfound.ai/tag/${qrModalItem.qrCodeId || qrModalItem.id}`;

      QRCode.toDataURL(targetUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [qrModalItem]);

  if (!qrModalItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-400 shrink-0" />
            <h2 className="text-sm font-bold text-white">
              Smart QR Asset Recovery Tag
            </h2>
          </div>

          <button
            onClick={() => setQrModalItem(null)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tag Body */}
        <div className="p-5 sm:p-6 text-center space-y-4 bg-slate-50">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-md max-w-xs mx-auto space-y-3">
            <div className="text-xs font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Orbit AI TAG
            </div>

            {qrDataUrl ? (
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-xl ring-4 ring-slate-100 overflow-hidden">
                <Image
                  src={qrDataUrl}
                  alt="QR Code Tag"
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-44 h-44 sm:w-48 sm:h-48 mx-auto bg-slate-100 animate-pulse rounded-xl" />
            )}

            <div>
              <div className="text-xs font-bold text-slate-900">{qrModalItem.title}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Tag ID: {qrModalItem.qrCodeId || qrModalItem.id}
              </div>
            </div>

            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-medium text-indigo-900 leading-normal">
              If found, scan QR code or visit app to notify owner anonymously & securely.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`QR_Asset_Tag_${qrModalItem.title.replace(/\s+/g, '_')}.png`}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                Download Tag Image
              </a>
            )}

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              Print Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
