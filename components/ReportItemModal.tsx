'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store-context';
import { ItemCategory, ItemType } from '@/types/lost-and-found';
import {
  X,
  Upload,
  Sparkles,
  MapPin,
  Calendar,
  Gift,
  HelpCircle,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Wallets & Bags',
  'ID Cards & Documents',
  'Keys',
  'Jewelry & Watches',
  'Clothing & Accessories',
  'Pets',
  'Books & Stationery',
  'Other',
];

export function ReportItemModal() {
  const {
    reportModalOpen,
    setReportModalOpen,
    reportType,
    addItemReport,
    currentUser,
  } = useAppStore();

  const [type, setType] = useState<ItemType>(reportType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('Black');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [brand, setBrand] = useState('');
  const [venue, setVenue] = useState('Main Campus Library');
  const [areaDetail, setAreaDetail] = useState('');
  const [city, setCity] = useState('Boston, MA');
  const [custodyLocation, setCustodyLocation] = useState('Security Guard Counter');
  const [dateOccurred, setDateOccurred] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [rewardAmount, setRewardAmount] = useState<number | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [verificationQuestions, setVerificationQuestions] = useState<string[]>([
    'What specific serial number or identifying mark is present?',
    'What is stored inside the inner pocket or case?',
  ]);

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisSuccess, setAiAnalysisSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!reportModalOpen) return null;

  // Handle Image Upload & Conversion to Base64 Data URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAiAnalysisSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Gemini AI Auto-Analyze on the image + draft info
  const handleAiAutoAnalyze = async () => {
    if (!imagePreview && !title && !description) {
      alert('Please upload an image or enter a title/description first so AI can analyze it.');
      return;
    }

    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          imageBase64: imagePreview,
          itemType: type,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        const a = data.analysis;
        if (a.suggestedTitle && (!title || title.length < 5)) setTitle(a.suggestedTitle);
        if (a.category && CATEGORIES.includes(a.category)) setCategory(a.category);
        if (a.primaryColor) setPrimaryColor(a.primaryColor);
        if (a.brand) setBrand(a.brand);
        if (a.extractedOcrText) setOcrText(a.extractedOcrText);
        if (a.aiTags) setAiTags(a.aiTags);
        if (a.summaryDescription && (!description || description.length < 10)) {
          setDescription(a.summaryDescription);
        }
        if (a.suggestedVerificationQuestions && a.suggestedVerificationQuestions.length > 0) {
          setVerificationQuestions(a.suggestedVerificationQuestions);
        }
        setAiAnalysisSuccess(true);
      }
    } catch (err) {
      console.error('AI Auto-Analyze error:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Submit Report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim()) return;

    setSubmitting(true);
    try {
      await addItemReport({
        type,
        title: title.trim(),
        category,
        description: description.trim() || 'No additional description provided.',
        primaryColor,
        secondaryColor: secondaryColor.trim() || undefined,
        brand: brand.trim() || undefined,
        dateReported: new Date().toISOString(),
        dateOccurred: new Date(dateOccurred).toISOString(),
        location: {
          venue: venue.trim(),
          areaDetail: areaDetail.trim() || undefined,
          city: city.trim() || undefined,
        },
        images: imagePreview ? [imagePreview] : ['https://picsum.photos/seed/item_default/600/400'],
        ocrText: ocrText.trim() || undefined,
        aiTags: aiTags.length > 0 ? aiTags : [category.toLowerCase(), primaryColor.toLowerCase()],
        rewardAmount: type === 'LOST' ? rewardAmount : undefined,
        custodyLocation: type === 'FOUND' ? custodyLocation.trim() : undefined,
        status: 'PENDING_MATCH',
        reporter: {
          userId: currentUser?.id || 'community_user',
          name: currentUser?.name || 'Community Member',
          email: currentUser?.email || 'community@lostandfound.ai',
          avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
          role: currentUser?.role === 'admin' ? 'admin' : type === 'LOST' ? 'owner' : 'finder',
        },
        verificationQuestions,
      });

      setReportModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Report {type === 'LOST' ? 'Lost Item' : 'Found Item'}
              </h2>
              <p className="text-[11px] text-slate-400">
                AI Auto-Extraction & Cross-Matching
              </p>
            </div>
          </div>

          <button
            onClick={() => setReportModalOpen(false)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {/* Item Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('LOST')}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                type === 'LOST'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              I LOST SOMETHING
            </button>
            <button
              type="button"
              onClick={() => setType('FOUND')}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                type === 'FOUND'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              I FOUND SOMETHING
            </button>
          </div>

          {/* Photo Upload & AI Auto-Analyze Feature */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-600 shrink-0" /> Upload Item Photo
              </label>

              <button
                type="button"
                onClick={handleAiAutoAnalyze}
                disabled={aiAnalyzing}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                {aiAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                )}
                {aiAnalyzing ? 'Analyzing Image...' : 'AI Auto-Extract Image Info'}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>

            {imagePreview && (
              <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
            )}

            {aiAnalysisSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>AI Analysis Applied!</strong> Category, colors, OCR text, and verification questions auto-filled.
                </div>
              </div>
            )}
          </div>

          {/* Basic Item Details */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Leather Wallet with Student ID, Apple AirPods Max"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Primary Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. Black, Navy Blue, Silver"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Brand / Make
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apple, Nike, Herschel"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                />
              </div>

              {type === 'LOST' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-500" /> Offered Reward ($)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={rewardAmount || ''}
                    onChange={(e) =>
                      setRewardAmount(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Safe Custody Spot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Turned into Security Desk"
                    value={custodyLocation}
                    onChange={(e) => setCustodyLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Detailed Description
              </label>
              <textarea
                rows={3}
                placeholder="Mention distinct scratches, stickers, contents, or key features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Location & Time Information */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" /> Location & Timing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Primary Venue / Building *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Campus Library, Airport Terminal 1"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Area / Floor Detail
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2nd Floor Study Cubicles"
                  value={areaDetail}
                  onChange={(e) => setAreaDetail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date & Time Occurred
              </label>
              <input
                type="datetime-local"
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          {/* AI Extracted Information (OCR Text) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" /> OCR Text & Verification
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Extracted Text / Name on Card (OCR)
              </label>
              <input
                type="text"
                placeholder="e.g. Student ID #982134, John Doe"
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Security Verification Question
              </label>
              <input
                type="text"
                value={verificationQuestions[0] || ''}
                onChange={(e) => {
                  const updated = [...verificationQuestions];
                  updated[0] = e.target.value;
                  setVerificationQuestions(updated);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
                type === 'LOST'
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              } disabled:opacity-50`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {submitting ? 'Submitting Report...' : `Publish ${type === 'LOST' ? 'Lost' : 'Found'} Report`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
