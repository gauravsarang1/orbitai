'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store-context';
import {
  X,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  Loader2,
  Lock,
} from 'lucide-react';

export function ClaimVerificationModal() {
  const {
    claimModalItem,
    setClaimModalItem,
    submitClaimAnswers,
    setActiveChatConvId,
  } = useAppStore();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resultScore, setResultScore] = useState<number | null>(null);
  const [resultFeedback, setResultFeedback] = useState<string | null>(null);

  if (!claimModalItem) return null;

  const item = claimModalItem;
  const questions = item.verificationQuestions || [
    'Describe specific inner contents, serial numbers, or stickers on this item.',
    'Where and when did you lose or last see this item?',
  ];

  const handleAnswerChange = (qIndex: number, text: string) => {
    setAnswers((prev) => ({ ...prev, [`q_${qIndex}`]: text }));
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const claim = await submitClaimAnswers(item.id, answers);
      setResultScore(claim.aiVerificationScore || 85);
      setResultFeedback(claim.aiVerificationFeedback || 'Verification complete!');

      setTimeout(() => {
        setClaimModalItem(null);
        setActiveChatConvId(`conv_${item.id}`);
      }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Ownership Verification Quiz
              </h2>
              <p className="text-[11px] text-slate-400">
                Answer security questions to claim &quot;{item.title}&quot;
              </p>
            </div>
          </div>

          <button
            onClick={() => setClaimModalItem(null)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-slate-50">
          {/* Safety Warning */}
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900">
            <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-normal">
              <strong>Secure Privacy Protection:</strong> Your responses are evaluated by AI to prevent fraud and bogus claims. Safe custody details will be unlocked upon claim approval.
            </div>
          </div>

          {resultScore !== null ? (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Claim Submitted & Verified!
              </h3>

              <div className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-black text-xs">
                AI Verification Score: {resultScore}% Accuracy
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                {resultFeedback}
              </p>

              <div className="text-xs font-semibold text-indigo-600">
                Opening private chat room with finder...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5 leading-normal">
                    <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    Question {idx + 1}: {q}
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={answers[`q_${idx}`] || ''}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    placeholder="Provide detailed, authentic answer..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              ))}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setClaimModalItem(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Evaluating Claim...' : 'Submit Claim & Verify'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

