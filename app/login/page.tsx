'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import {
  Sparkles,
  ShieldCheck,
  Search,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Send,
  KeyRound,
  Laptop,
} from 'lucide-react';
import {
  loginWithCredentials,
  registerWithCredentials,
  verifyLoginOTPAndSignIn,
} from '@/app/actions/auth-actions';

type AuthMode = 'SIGN_IN' | 'REGISTER';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get('error');
  const verifiedParam = searchParams.get('verified');
  const resetParam = searchParams.get('reset');
  const modeParam = searchParams.get('mode');
  const emailParam = searchParams.get('email');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [mode, setMode] = useState<AuthMode>(
    modeParam?.toUpperCase() === 'REGISTER' ? 'REGISTER' : 'SIGN_IN'
  );

  // Form State
  const [email, setEmail] = useState(emailParam || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2FA / Login OTP State
  const [requiresLoginOtp, setRequiresLoginOtp] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customSuccessMsg, setCustomSuccessMsg] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const successMsg =
    customSuccessMsg ||
    (verifiedParam
      ? 'Your email address has been verified successfully! You can now sign in.'
      : resetParam
      ? 'Your password has been reset! Please sign in with your new password.'
      : null);

  const getErrorMessage = (error: string | null) => {
    if (!error) return null;
    switch (error) {
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
        return 'An error occurred during Google authentication. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'An account with this email already exists. Sign in with password or linked method.';
      case 'EmailSignin':
        return 'The email sign-in link is invalid or has expired.';
      case 'CredentialsSignin':
        return 'Sign in failed. Check your email and password.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      case 'ForbiddenAdmin':
        return 'Access denied. You need Administrator privileges to access that section.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const initialError = getErrorMessage(errorParam);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCustomSuccessMsg(null);
    setUnverifiedEmail(null);
    setLoading(true);

    try {
      if (mode === 'SIGN_IN') {
        const storedDeviceToken = typeof window !== 'undefined'
          ? localStorage.getItem('device_token') || undefined
          : undefined;

        const res = await loginWithCredentials({
          email,
          password,
          deviceToken: storedDeviceToken,
          callbackUrl,
        });

        if (!res.success) {
          if (res.isUnverified && res.email) {
            setUnverifiedEmail(res.email);
            setErrorMsg(res.error || 'Your email is not verified. Redirecting...');
            const codeQuery = res.devOtp ? `&code=${encodeURIComponent(res.devOtp)}` : '';
            setTimeout(() => {
              window.location.href = `/verify-email?email=${encodeURIComponent(res.email)}${codeQuery}`;
            }, 500);
          } else {
            setErrorMsg(res.error || 'Invalid credentials');
          }
        } else if (res.requiresLoginOtp) {
          setRequiresLoginOtp(true);
          setDevOtp(res.devOtp || null);
          setCustomSuccessMsg('Verification code sent to your email.');
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } else if (mode === 'REGISTER') {
        const res = await registerWithCredentials({
          name,
          email,
          password,
          confirmPassword,
        });

        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed');
        } else {
          const targetEmail = res.email || email;
          setCustomSuccessMsg('Verification OTP sent! Redirecting to email verification...');
          const codeQuery = res.devOtp ? `&code=${encodeURIComponent(res.devOtp)}` : '';
          window.location.href = `/verify-email?email=${encodeURIComponent(targetEmail)}${codeQuery}`;
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await verifyLoginOTPAndSignIn({
        email,
        password,
        otp: loginOtp,
        rememberDevice,
        callbackUrl,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Invalid verification code.');
      } else {
        if (res.deviceToken && typeof window !== 'undefined') {
          localStorage.setItem('device_token', res.deviceToken);
        }
        router.push(res.callbackUrl || callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to verify login OTP. Please try again.');
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
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
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
          {requiresLoginOtp
            ? 'Two-Factor Login Verification'
            : mode === 'SIGN_IN'
            ? 'Sign in to your account'
            : 'Create your account'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          {requiresLoginOtp
            ? `Enter the 6-digit code sent to ${email}`
            : 'Access smart AI item matching, claim verification, and secure community recovery'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/80 sm:px-8">
          {/* Error Banner */}
          {(initialError || errorMsg) && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg || initialError}</span>
                {unverifiedEmail && (
                  <div className="mt-2.5 pt-2 border-t border-red-500/20 flex items-center justify-between">
                    <span className="text-[11px] text-red-300">
                      Need to verify your email?
                    </span>
                    <Link
                      href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Verify Email</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-400 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dev OTP Box */}
          {devOtp && requiresLoginOtp && (
            <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-amber-300 text-xs">
              <span>Dev OTP Code:</span>
              <span className="font-mono font-bold text-sm text-white bg-amber-600/30 px-2 py-1 rounded">
                {devOtp}
              </span>
            </div>
          )}

          {/* 2FA Login OTP Form */}
          {requiresLoginOtp ? (
            <form onSubmit={handleLoginOtpSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base tracking-widest text-center placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                <input
                  type="checkbox"
                  id="rememberDevice"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <label htmlFor="rememberDevice" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Trust & Remember this device for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || loginOtp.length !== 6}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code & Sign In</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequiresLoginOtp(false);
                    setLoginOtp('');
                  }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Mode Switcher Tabs */}
              <div className="flex bg-slate-900/80 p-1 rounded-xl mb-6 border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_IN');
                    setErrorMsg(null);
                    setCustomSuccessMsg(null);
                    setUnverifiedEmail(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'SIGN_IN'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setErrorMsg(null);
                    setCustomSuccessMsg(null);
                    setUnverifiedEmail(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'REGISTER'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              <div className="space-y-4">
                {/* Google OAuth Option */}
                <GoogleSignInButton label="Continue with Google" callbackUrl={callbackUrl} />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                    <span className="bg-slate-800 px-3 text-slate-400 font-semibold">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email + Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'REGISTER' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address
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

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {showPassword ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Show</span>
                            </>
                          )}
                        </button>
                        {mode === 'SIGN_IN' && (
                          <Link
                            href="/forgot-password"
                            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                          >
                            Forgot password?
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={mode === 'REGISTER' ? 8 : 1}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {mode === 'REGISTER' && <PasswordStrengthMeter password={password} />}
                  </div>

                  {mode === 'REGISTER' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {mode === 'SIGN_IN' ? (
                          <span>Sign In with Email</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Verification OTP Code</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <Link
                    href="/verify-email"
                    className="text-xs font-medium text-slate-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Already received a code? Enter verification code here
                  </Link>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 space-y-2 mt-6">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Nodemailer Email Verification & 2FA</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    New accounts require a 6-digit OTP verification code. Secured with bcrypt password hashing and 2FA login verification.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          By signing in, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
          Loading sign in options...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
