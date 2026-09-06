'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { OtpInput } from '@/components/auth/OtpInput';
import {
  Sparkles,
  Search,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Mail,
  Loader2,
  Clock,
  RotateCcw,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { verifyRegistrationOTP, resendRegistrationOTP } from '@/app/actions/auth-actions';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get('email')?.trim() || '';
  const codeParam = searchParams.get('code')?.trim() || searchParams.get('devOtp')?.trim() || null;

  const isValidEmail = Boolean(emailParam && emailParam.includes('@'));

  const [otp, setOtp] = useState(codeParam || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(codeParam);

  // Timers: 5-min total expiry timer (300s), 60-s resend cooldown timer
  const [expirySeconds, setExpirySeconds] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(60);

  // Countdown effect for expiry
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const interval = setInterval(() => {
      setExpirySeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [expirySeconds]);

  // Countdown effect for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading || verified) return;
    if (!isValidEmail) {
      setErrorMsg('Invalid verification link. Please register again.');
      return;
    }
    if (otp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await verifyRegistrationOTP({ email: emailParam, otp });
      if (!res.success) {
        setErrorMsg(res.error || 'Verification failed. Please check the code.');
      } else {
        setVerified(true);
        setSuccessMsg(res.message || 'Email verified successfully!');
        setTimeout(() => {
          router.push(`/login?verified=true&email=${encodeURIComponent(emailParam)}`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    if (!isValidEmail) {
      setErrorMsg('Invalid verification link. Email missing.');
      return;
    }

    setResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await resendRegistrationOTP(emailParam);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to resend code.');
      } else {
        setSuccessMsg(res.message || 'A new 6-digit verification code has been sent.');
        setDevOtp(res.devOtp || null);
        setExpirySeconds(300); // Reset 5-min timer
        setResendCooldown(60); // Reset 60s cooldown
        setOtp('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while resending code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (!isValidEmail) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              Lost&Found <span className="text-indigo-400">AI</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </span>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/80 sm:px-8 space-y-5">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">Invalid Verification Link</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              No valid email address was found in the verification URL. Please start registration again.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer gap-2"
              >
                <span>Return to Registration</span>
              </Link>
            </div>
            <div>
              <Link
                href="/login"
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          Verify Your Email Address
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 px-4">
          Enter the 6-digit code sent to your registered email inbox
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/80 sm:px-8">
          {verified ? (
            /* Success Verification State */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-white">Email Address Verified!</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Your account has been created and verified. Redirecting you to sign in...
              </p>
              <div className="pt-2">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
              </div>
            </div>
          ) : (
            /* Form Verification State */
            <form onSubmit={handleVerify} className="space-y-6">
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
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Dev OTP Box */}
              {devOtp && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-amber-300 text-xs">
                  <div className="flex items-center gap-2">
                    <span>Dev Verification Code:</span>
                    <span className="font-mono font-bold text-sm text-white bg-amber-600/30 px-2.5 py-1 rounded">
                      {devOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="text-[11px] font-bold text-amber-200 hover:text-white bg-amber-600/40 hover:bg-amber-600/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              {/* Pre-filled & Disabled Email Address Display */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Email Address
                  </label>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Verified Target
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={emailParam}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-300 font-medium text-xs cursor-not-allowed select-none opacity-80"
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* 6-Digit OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    6-Digit Verification Code
                  </label>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {expirySeconds > 0 ? formatTime(expirySeconds) : 'Code Expired'}
                    </span>
                  </div>
                </div>

                <OtpInput value={otp} onChange={setOtp} disabled={loading} />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6 || expirySeconds <= 0}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify Email & Create Account</span>
                )}
              </button>

              {/* Resend OTP Section */}
              <div className="pt-2 text-center border-t border-slate-700/60">
                <p className="text-xs text-slate-400 mb-2">Didn&apos;t receive the code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resending}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {resending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {resendCooldown > 0
                      ? `Resend Code in ${resendCooldown}s`
                      : 'Resend Verification Code'}
                  </span>
                </button>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/50 space-y-1 mt-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Secure Account Creation</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Verification codes are encrypted and valid for 5 minutes. Accounts require email verification to prevent spam and unauthorized signups.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
          Loading verification portal...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

