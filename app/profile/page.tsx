'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getInitials } from '@/lib/utils';
import { useAppStore } from '@/lib/store-context';
import { EditReportModal } from '@/components/EditReportModal';
import { getUserProfile, updateUserProfile, changePassword } from '@/app/actions/profile-actions';
import { deleteUserReport, updateUserReport } from '@/app/actions/report-actions';
import { ItemReport, ItemStatus } from '@/types/lost-and-found';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Sparkles,
  Key,
  Smartphone,
  Globe,
  Bell,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  Edit3,
  RefreshCw,
  Lock,
  Zap,
  ArrowLeft,
  Check,
  FileText,
  PlusCircle,
  Trash2,
  ChevronDown,
  MapPin,
  Tag,
  Clock,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    items,
    currentUser,
    updateItemStatus,
    deleteItemReport,
    updateItemReport,
    setReportModalOpen,
    setReportType,
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Edit Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('+1 (555) 019-2834');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Preferences state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [aiNotifs, setAiNotifs] = useState(true);
  const [language, setLanguage] = useState('English (US)');
  const [timezone, setTimezone] = useState('UTC-5 (Eastern Time)');

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Report Management State
  const [editingItem, setEditingItem] = useState<ItemReport | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserProfile();
      if (res.success && res.user) {
        setUserProfile(res.user);
        setNameInput(res.user.name || '');
      } else {
        if (session?.user) {
          setUserProfile({
            id: session.user.id,
            name: session.user.name || 'Authenticated User',
            email: session.user.email || '',
            image: session.user.image || null,
            role: session.user.role || 'USER',
            username: `@${session.user.email?.split('@')[0] || 'user'}`,
            createdAt: new Date().toISOString(),
          });
          setNameInput(session.user.name || '');
        } else {
          setError(res.error || 'Failed to load profile details.');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (session?.user) {
        setUserProfile({
          id: session.user.id,
          name: session.user.name || 'Authenticated User',
          email: session.user.email || '',
          image: session.user.image || null,
          role: session.user.role || 'USER',
          username: `@${session.user.email?.split('@')[0] || 'user'}`,
          createdAt: new Date().toISOString(),
        });
        setNameInput(session.user.name || '');
      } else {
        setError('Unable to load your profile. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);
    try {
      const res = await updateUserProfile({ name: nameInput, phone: phoneInput });
      if (res.success) {
        setUserProfile((prev: any) => ({ ...prev, name: nameInput }));
        setProfileSuccessMsg('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setProfileSuccessMsg(null), 3000);
      } else {
        setError(res.error || 'Could not update profile');
      }
    } catch (err) {
      setError('An error occurred while saving profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setPasswordSuccess(res.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 2000);
      } else {
        setPasswordError(res.error || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError('An unexpected error occurred.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Filter items reported by this user
  const userEmail = session?.user?.email || currentUser?.email || '';
  const myReports = items.filter(
    (item) =>
      (item.reporter?.email &&
        userEmail &&
        item.reporter.email.toLowerCase() === userEmail.toLowerCase()) ||
      (item.reporter?.userId && currentUser?.id && item.reporter.userId === currentUser.id)
  );

  const handleQuickStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    try {
      await updateUserReport(itemId, { status: newStatus });
      updateItemStatus(itemId, newStatus);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleDeleteReport = async (itemId: string) => {
    setDeletingId(itemId);
    try {
      const res = await deleteUserReport(itemId);
      if (res.success) {
        deleteItemReport(itemId);
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Delete report error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Skeleton Loading State
  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          {/* Header Card Skeleton */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 animate-pulse flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-3 w-full text-center sm:text-left">
              <div className="h-7 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto sm:mx-0" />
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto sm:mx-0" />
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto sm:mx-0" />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse" />
              <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse" />
              <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error State
  if (error && !userProfile) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to load your profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </main>
    );
  }

  const initials = getInitials(userProfile?.name, userProfile?.email);
  const joinedDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'August 2026';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back navigation & Page title */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Account Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Manage your personal identity, reports, security, and app preferences
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Global Toast Success Message */}
        {profileSuccessMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        {/* 1. Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with fallback */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 ring-4 ring-indigo-500/20 dark:ring-indigo-500/40 bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg">
              {userProfile?.image ? (
                <Image
                  src={userProfile.image}
                  alt={userProfile.name || 'User avatar'}
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              ) : initials ? (
                <span className="font-black text-2xl sm:text-3xl tracking-widest text-white">
                  {initials}
                </span>
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>

            {/* Profile Header Metadata */}
            <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                  {userProfile?.name || 'Authenticated User'}
                </h2>
                <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/80">
                  {userProfile?.role === 'ADMIN' ? '⚡ ADMIN' : 'USER'}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 font-mono truncate">
                {userProfile?.username || `@${userProfile?.email?.split('@')[0]}`}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  {userProfile?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Member since {joinedDate}
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Layout (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols wide on Desktop) */}
          <div className="lg:col-span-2 space-y-6">

            {/* MY REPORTS MANAGEMENT SECTION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      My Reports
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black px-2 py-0.5 rounded-full">
                        {myReports.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage, edit, update status, or remove your submitted reports
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReportType('LOST');
                    setReportModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report New Item</span>
                </button>
              </div>

              {/* Reports List */}
              {myReports.length === 0 ? (
                <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No reports filed yet
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Items you report as Lost or Found will appear here for easy management
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setReportType('LOST');
                      setReportModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Report Lost Item
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myReports.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Item Thumbnail / Placeholder */}
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300/60 dark:border-slate-700 flex items-center justify-center">
                          {item.images && item.images.length > 0 ? (
                            <Image
                              src={item.images[0]}
                              alt={item.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                item.type === 'LOST'
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {item.type}
                            </span>

                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-indigo-500" />
                              {item.category}
                            </span>
                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                              <MapPin className="w-3 h-3 text-indigo-500" />
                              {item.location?.venue || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              {new Date(item.dateReported).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Controls & Quick Status */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Quick Status Selector */}
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleQuickStatusChange(item.id, e.target.value as ItemStatus)
                          }
                          className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="PENDING_MATCH">Pending Match</option>
                          <option value="CLAIMED">Claimed</option>
                          <option value="RETURNED">Returned</option>
                          <option value="EXPIRED">Expired</option>
                        </select>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Report"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Account Information Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Account Information
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Your identity and contact details
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Account
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {userProfile?.name || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Username
                    </label>
                    <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400">
                      {userProfile?.username || `@${userProfile?.email?.split('@')[0]}`}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                      {userProfile?.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400">
                        {phoneInput}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      System Role
                    </label>
                    <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {userProfile?.role || 'USER'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Account Status
                    </label>
                    <div className="px-3.5 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active & Protected
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* 3. AI Usage & Activity Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      AI Usage & Activity
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Overview of your multimodal AI matching operations
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center space-y-1">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Reports Filed</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">{myReports.length}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center space-y-1">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">AI Matches</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {myReports.filter((r) => r.status === 'PENDING_MATCH' || r.status === 'CLAIMED').length}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center space-y-1">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Returned</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {myReports.filter((r) => r.status === 'RETURNED').length}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center space-y-1">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Listings</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {myReports.filter((r) => r.status === 'ACTIVE').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col wide on Desktop) */}
          <div className="space-y-6">
            {/* 4. Preferences Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Preferences</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">System settings</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                    App Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`py-2 px-3 rounded-xl border font-bold capitalize transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          theme === t
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {t === 'light' && <Sun className="w-3.5 h-3.5" />}
                        {t === 'dark' && <Moon className="w-3.5 h-3.5" />}
                        {t === 'system' && <Zap className="w-3.5 h-3.5" />}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Notifications
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Email Alerts</span>
                    <button
                      onClick={() => setEmailNotifs(!emailNotifs)}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        emailNotifs ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          emailNotifs ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">AI Match Scans</span>
                    <button
                      onClick={() => setAiNotifs(!aiNotifs)}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        aiNotifs ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          aiNotifs ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                    >
                      <option>English (US)</option>
                      <option>Spanish (ES)</option>
                      <option>French (FR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                    >
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+5:30 (IST)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Security Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Security</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Authentication controls</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-500" />
                    Change Password
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400">Update →</span>
                </button>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-500" />
                    Connected Accounts
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold">
                      {userProfile?.provider || 'Credentials / Email'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    Two-Factor Authentication
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Trusted Device Protection enabled
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Account Actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Report Modal */}
      <EditReportModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Report?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this report? It will be removed from community listings and cancel all AI matches.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReport(deleteConfirmId)}
                disabled={!!deletingId}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
              >
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
