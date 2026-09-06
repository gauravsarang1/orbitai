'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useAppStore } from '@/lib/store-context';
import {
  Sparkles,
  PlusCircle,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LogIn,
  ShieldCheck,
  User,
} from 'lucide-react';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { getInitials } from '@/lib/utils';


export function Navbar() {
  const { data: session, status } = useSession();
  const {
    currentUser,
    setReportModalOpen,
    setReportType,
    setVisualSearchModalOpen,
    unreadNotificationCount,
    runGlobalAiMatching,
    items,
    matches,
    setSelectedType,
  } = useAppStore();

  const userObj = session?.user as any;
  const isAuthenticated = status === 'authenticated' || !!userObj || !!currentUser;
  const userName = userObj?.name || currentUser?.name || '';
  const userEmail = userObj?.email || currentUser?.email || '';
  const userAvatar = userObj?.image || currentUser?.avatar || '';
  const userInitials = getInitials(userName, userEmail);


  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchToast, setMatchToast] = useState<string | null>(null);


  const handleGlobalMatch = async () => {
    setMatchingLoading(true);
    try {
      const count = await runGlobalAiMatching();
      setMatchToast(
        count > 0
          ? `✨ AI Scan Complete! Found ${count} new item match pair(s).`
          : `✨ AI Scan Complete! All lost & found items are synced.`
      );
      setTimeout(() => setMatchToast(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setMatchingLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-100 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 flex items-center justify-between gap-2 font-medium">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border border-indigo-500/30 shrink-0">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> AI Core v3.6
          </span>
          <span className="truncate text-slate-300">
            Automated Lost & Found Cross-Matching Engine
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] shrink-0 font-mono">
          <span className="text-slate-400">Items: <strong className="text-white">{items.length}</strong></span>
          <span className="text-slate-400">Matches: <strong className="text-emerald-400">{matches.length}</strong></span>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                Orbit AI
              </span>
              <span className="bg-indigo-50 text-indigo-700 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-200/60">
                PRO
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block">Smart Multimodal Matching & Recovery</p>
          </div>
        </Link>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* AI Global Scan */}
          <button
            onClick={handleGlobalMatch}
            disabled={matchingLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50 min-h-[40px]"
            title="Trigger full AI cross-matching scan across all lost and found items"
          >
            <Sparkles className={`w-3.5 h-3.5 ${matchingLoading ? 'animate-spin text-indigo-600' : 'text-indigo-500'}`} />
            {matchingLoading ? 'AI Scanning...' : 'Run AI Engine'}
          </button>

          {/* Visual Search Button */}
          <button
            onClick={() => setVisualSearchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-colors cursor-pointer min-h-[40px]"
          >
            <Search className="w-3.5 h-3.5 text-slate-600" />
            <span>Visual Search</span>
          </button>

          {/* Report Lost Item */}
          <button
            onClick={() => {
              setReportType('LOST');
              setReportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer min-h-[40px]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Lost
          </button>

          {/* Report Found Item */}
          <button
            onClick={() => {
              setReportType('FOUND');
              setReportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer min-h-[40px]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Found
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
            {notifOpen && <NotificationsDropdown onClose={() => setNotifOpen(false)} />}
          </div>

          {/* User Section (Profile Icon Button when Logged In, Sign In when Logged Out) */}
          <div className="relative pl-2 border-l border-slate-200 flex items-center gap-2">
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer min-h-[40px]"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            ) : (
              <Link
                href="/profile"
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer min-h-[40px] group"
                title="View Profile"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-indigo-500/30 bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-700 shadow-xs group-hover:ring-indigo-600 transition-all">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt={userName || 'User profile'}
                      fill
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  ) : userInitials ? (
                    <span className="font-extrabold text-xs tracking-wider text-indigo-700">
                      {userInitials}
                    </span>
                  ) : (
                    <User className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                    <span className="truncate max-w-[120px]">{userName || 'Profile'}</span>
                    {(currentUser?.role === 'admin' || userObj?.role === 'ADMIN') && (
                      <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-1.5 py-0.2 rounded-md shrink-0">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {userEmail}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>


        {/* Mobile Buttons */}
        <div className="flex lg:hidden items-center gap-1.5">
          <button
            onClick={() => setVisualSearchModalOpen(true)}
            className="p-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Visual Search"
          >
            <Search className="w-4 h-4 text-slate-700" />
          </button>

          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 relative transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
            {notifOpen && <NotificationsDropdown onClose={() => setNotifOpen(false)} />}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center ml-1"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-700" /> : <Menu className="w-5 h-5 text-indigo-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl">
          <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2 shadow-xs">
            {isAuthenticated ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-indigo-400 bg-indigo-900/50 flex items-center justify-center font-bold text-xs text-indigo-200">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt={userName || 'User profile'}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    ) : userInitials ? (
                      <span className="font-extrabold text-xs text-indigo-200">
                        {userInitials}
                      </span>
                    ) : (
                      <User className="w-4 h-4 text-indigo-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{userName || 'Profile'}</span>
                      {(currentUser?.role === 'admin' || userObj?.role === 'ADMIN') && (
                        <span className="bg-purple-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md shrink-0">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">{userEmail}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg shrink-0 group-hover:bg-indigo-500/30">
                  Profile →
                </span>
              </Link>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white">Orbit AI Portal</div>
                  <div className="text-[10px] text-slate-300">Sign in to report or claim items</div>
                </div>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                setReportType('LOST');
                setReportModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full min-h-[44px] py-3 px-3 bg-rose-600 active:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost
            </button>

            <button
              onClick={() => {
                setReportType('FOUND');
                setReportModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full min-h-[44px] py-3 px-3 bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                handleGlobalMatch();
                setMobileMenuOpen(false);
              }}
              disabled={matchingLoading}
              className="w-full min-h-[44px] py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${matchingLoading ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
              {matchingLoading ? 'Scanning Database...' : 'Run Global AI Match Scan'}
            </button>

            <button
              onClick={() => {
                setVisualSearchModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full min-h-[44px] py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-600" />
              Upload Photo for Visual Search
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {matchToast && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center transition-all animate-bounce">
          {matchToast}
        </div>
      )}
    </header>
  );
}
