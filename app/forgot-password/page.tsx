'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Mail,
  Loader2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { requestForgotPasswordOTP } from '@/app/actions/auth-actions';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await requestForgotPasswordOTP(email);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to request reset code.');
      } else {
        setSuccessMsg(res.message || 'Password reset code generated and sent.');
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1800);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Sign In</span>
        </Link>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            Lost&Found <span className="text-indigo-400">AI</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </span>
        </div>

        <h2 className="mt-2 text-center text-xl font-bold tracking-tight text-white">
          Forgot Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enter your account email address to receive a 6-digit password reset OTP code.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/80 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-400 text-xs animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p>{successMsg}</p>
                  <p className="mt-1 text-[11px] text-emerald-300/80">
                    Redirecting to verification...
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sending Reset Code...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Password Reset OTP</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/reset-password"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                Already have a reset code? Reset password here
              </Link>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/50 space-y-1 mt-4">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Encrypted Recovery</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Password reset codes are single-use, hashed with crypto-secure algorithms, and expire after 5 minutes.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
