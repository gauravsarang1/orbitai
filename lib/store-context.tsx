'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  ItemReport,
  AIMatchResult,
  ClaimRequest,
  ChatMessage,
  NotificationItem,
  ItemCategory,
  ItemType,
  ItemStatus,
} from '@/types/lost-and-found';
import {
  INITIAL_ITEMS,
  INITIAL_MATCHES,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
} from '@/lib/sample-data';

function generateUniqueId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function generateQrCodeId(): string {
  return `QR-LFA-${Math.floor(10000 + Math.random() * 90000)}`;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'owner' | 'finder' | 'user';
}

interface AppStoreContextType {
  currentUser: CurrentUser | null;
  items: ItemReport[];
  matches: AIMatchResult[];
  claims: ClaimRequest[];
  messages: Record<string, ChatMessage[]>;
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Filter States
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ItemCategory | 'ALL';
  setSelectedCategory: (c: ItemCategory | 'ALL') => void;
  selectedType: ItemType | 'ALL';
  setSelectedType: (t: ItemType | 'ALL') => void;
  selectedStatus: ItemStatus | 'ALL';
  setSelectedStatus: (s: ItemStatus | 'ALL') => void;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  selectedVenue: string;
  setSelectedVenue: (v: string) => void;

  // Modals & Drawers
  reportModalOpen: boolean;
  setReportModalOpen: (open: boolean) => void;
  reportType: ItemType;
  setReportType: (type: ItemType) => void;
  selectedItemDetail: ItemReport | null;
  setSelectedItemDetail: (item: ItemReport | null) => void;
  visualSearchModalOpen: boolean;
  setVisualSearchModalOpen: (open: boolean) => void;
  qrModalItem: ItemReport | null;
  setQrModalItem: (item: ItemReport | null) => void;
  claimModalItem: ItemReport | null;
  setClaimModalItem: (item: ItemReport | null) => void;
  activeChatConvId: string | null;
  setActiveChatConvId: (convId: string | null) => void;

  // Actions
  addItemReport: (item: Omit<ItemReport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ItemReport>;
  runAiMatchForItem: (item: ItemReport) => Promise<AIMatchResult[]>;
  runGlobalAiMatching: () => Promise<number>;
  submitClaimAnswers: (itemId: string, answers: Record<string, string>) => Promise<ClaimRequest>;
  sendMessage: (convId: string, text: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateItemStatus: (itemId: string, newStatus: ItemStatus) => void;
  updateItemReport: (itemId: string, updatedData: Partial<ItemReport>) => void;
  deleteItemReport: (itemId: string) => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Derive currentUser dynamically from active authenticated session
  const currentUser: CurrentUser | null = session?.user
    ? {
        id: session.user.id || 'usr_' + (session.user.email || 'anon'),
        name: session.user.name || 'Authenticated User',
        email: session.user.email || '',
        avatar:
          session.user.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            session.user.name || session.user.email || 'User'
          )}`,
        role:
          session.user.role === 'ADMIN' ||
          session.user.email === 'gauravsarang223@gmail.com' ||
          session.user.email === 'gauravsarang2003@gmail.com'
            ? 'admin'
            : 'owner',
      }
    : null;

  const [items, setItems] = useState<ItemReport[]>(INITIAL_ITEMS);
  const [matches, setMatches] = useState<AIMatchResult[]>(INITIAL_MATCHES);
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);

  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ItemType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | 'ALL'>('ALL');
  const [selectedColor, setSelectedColor] = useState('ALL');
  const [selectedVenue, setSelectedVenue] = useState('ALL');

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<ItemType>('LOST');
  const [selectedItemDetail, setSelectedItemDetail] = useState<ItemReport | null>(null);
  const [visualSearchModalOpen, setVisualSearchModalOpen] = useState(false);
  const [qrModalItem, setQrModalItem] = useState<ItemReport | null>(null);
  const [claimModalItem, setClaimModalItem] = useState<ItemReport | null>(null);
  const [activeChatConvId, setActiveChatConvId] = useState<string | null>(null);

  // Load state from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedItems = localStorage.getItem('lost_and_found_items');
        if (savedItems) {
          const parsed = JSON.parse(savedItems);
          if (Array.isArray(parsed)) {
            setTimeout(() => setItems(parsed), 0);
          }
        }
      } catch (e) {
        console.error('Error reading localStorage items:', e);
      }

      try {
        const savedMatches = localStorage.getItem('lost_and_found_matches');
        if (savedMatches) {
          const parsed = JSON.parse(savedMatches);
          if (Array.isArray(parsed)) {
            setTimeout(() => setMatches(parsed), 0);
          }
        }
      } catch (e) {
        console.error('Error reading localStorage matches:', e);
      }

      setTimeout(() => setIsStoreLoaded(true), 0);
    }
  }, []);

  // Save state to localStorage after store is loaded
  useEffect(() => {
    if (isStoreLoaded && typeof window !== 'undefined') {
      localStorage.setItem('lost_and_found_items', JSON.stringify(items));
    }
  }, [items, isStoreLoaded]);

  useEffect(() => {
    if (isStoreLoaded && typeof window !== 'undefined') {
      localStorage.setItem('lost_and_found_matches', JSON.stringify(matches));
    }
  }, [matches, isStoreLoaded]);

  const unreadNotificationCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.read).length
    : 0;

  // Add Item Report
  const addItemReport = async (
    rawItem: Omit<ItemReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ItemReport> => {
    const id = generateUniqueId('item');
    const isoNow = new Date().toISOString();
    const newItem: ItemReport = {
      ...rawItem,
      id,
      qrCodeId: generateQrCodeId(),
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    setItems((prev) => [newItem, ...prev]);

    setTimeout(() => {
      runAiMatchForItem(newItem).catch((err) =>
        console.error('Auto match background error:', err)
      );
    }, 500);

    return newItem;
  };

  const runAiMatchForItem = async (targetItem: ItemReport): Promise<AIMatchResult[]> => {
    const oppositeType = targetItem.type === 'LOST' ? 'FOUND' : 'LOST';
    const candidateItems = items.filter(
      (i) => i.type === oppositeType && i.status !== 'RETURNED'
    );

    const newMatchResults: AIMatchResult[] = [];

    for (const candidate of candidateItems) {
      const existingMatch = matches.find(
        (m) =>
          (m.lostItemId === targetItem.id && m.foundItemId === candidate.id) ||
          (m.lostItemId === candidate.id && m.foundItemId === targetItem.id)
      );

      if (existingMatch) continue;

      const lostObj = targetItem.type === 'LOST' ? targetItem : candidate;
      const foundObj = targetItem.type === 'FOUND' ? targetItem : candidate;

      try {
        await new Promise((resolve) => setTimeout(resolve, 150));

        const res = await fetch('/api/gemini/match-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lostItem: lostObj, foundItem: foundObj }),
        });

        const data = await res.json();
        if (data.success && data.matchResult) {
          const resObj = data.matchResult;
          const matchItem: AIMatchResult = {
            id: 'match_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            lostItemId: lostObj.id,
            foundItemId: foundObj.id,
            matchScore: resObj.matchScore,
            overallVerdict: resObj.overallVerdict,
            visualSimilarityScore: resObj.visualSimilarityScore,
            textSimilarityScore: resObj.textSimilarityScore,
            locationScore: resObj.locationScore,
            colorScore: resObj.colorScore,
            aiReasoning: resObj.aiReasoning,
            breakdown: resObj.breakdown,
            status: 'SUGGESTED',
            createdAt: new Date().toISOString(),
          };

          newMatchResults.push(matchItem);

          if (resObj.matchScore >= 70) {
            const notif: NotificationItem = {
              id: 'notif_' + Date.now() + '_' + Math.random(),
              userId: lostObj.reporter.userId,
              title: `✨ AI Match Alert (${resObj.matchScore}% Match)!`,
              message: `A possible match for "${lostObj.title}" was reported at ${foundObj.location.venue}.`,
              type: 'MATCH_FOUND',
              relatedItemId: lostObj.id,
              relatedMatchId: matchItem.id,
              read: false,
              createdAt: new Date().toISOString(),
            };

            setNotifications((prev) => [notif, ...prev]);
          }
        }
      } catch (e) {
        console.error('Error matching pair:', e);
      }
    }

    if (newMatchResults.length > 0) {
      setMatches((prev) => [...newMatchResults, ...prev]);
    }

    return newMatchResults;
  };

  const runGlobalAiMatching = async (): Promise<number> => {
    let countNew = 0;
    const lostItems = items.filter((i) => i.type === 'LOST' && i.status !== 'RETURNED');
    for (const lostItem of lostItems) {
      const added = await runAiMatchForItem(lostItem);
      countNew += added.length;
    }
    return countNew;
  };

  const submitClaimAnswers = async (
    itemId: string,
    answers: Record<string, string>
  ): Promise<ClaimRequest> => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) throw new Error('Item not found');

    let aiEvaluation: any = null;
    try {
      const res = await fetch('/api/gemini/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: targetItem,
          userAnswers: answers,
        }),
      });
      const data = await res.json();
      if (data.success) {
        aiEvaluation = data.evaluation;
      }
    } catch (e) {
      console.error('Claim AI verification error:', e);
    }

    const claimantId = currentUser?.id || 'guest_user';
    const claimantName = currentUser?.name || 'Guest User';
    const claimantEmail = currentUser?.email || 'guest@example.com';

    const claimReq: ClaimRequest = {
      id: generateUniqueId('claim'),
      lostItemId: targetItem.type === 'LOST' ? targetItem.id : '',
      foundItemId: targetItem.type === 'FOUND' ? targetItem.id : '',
      claimantUserId: claimantId,
      claimantName: claimantName,
      claimantEmail: claimantEmail,
      status:
        aiEvaluation?.recommendation === 'APPROVED' || (aiEvaluation?.verificationScore || 0) >= 75
          ? 'APPROVED'
          : 'PENDING_VERIFICATION',
      answers,
      aiVerificationScore: aiEvaluation?.verificationScore || 70,
      aiVerificationFeedback:
        aiEvaluation?.feedback ||
        'Claim received and evaluated by Orbit AI. Pending final handover verification.',
      createdAt: new Date().toISOString(),
    };

    setClaims((prev) => [claimReq, ...prev]);
    updateItemStatus(targetItem.id, 'CLAIMED');

    const convId = `conv_${targetItem.id}`;
    const initialMsgs: ChatMessage[] = [
      {
        id: generateUniqueId('msg'),
        conversationId: convId,
        senderId: 'system',
        senderName: 'Orbit AI',
        senderRole: 'admin',
        text: `🎉 Claim Request Created for "${targetItem.title}". AI Verification Score: ${
          claimReq.aiVerificationScore
        }%. Status: ${claimReq.status}. You can coordinate handover location and details here.`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      },
    ];

    setMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), ...initialMsgs],
    }));

    return claimReq;
  };

  const sendMessage = (convId: string, text: string) => {
    if (!text.trim()) return;

    const senderId = currentUser?.id || 'guest_user';
    const senderName = currentUser?.name || 'Guest User';
    const senderRole = currentUser?.role === 'admin' ? 'admin' : 'owner';

    const msg: ChatMessage = {
      id: 'msg_' + Date.now(),
      conversationId: convId,
      senderId,
      senderName,
      senderRole,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), msg],
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  const updateItemStatus = (itemId: string, newStatus: ItemStatus) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, status: newStatus, updatedAt: new Date().toISOString() }
          : i
      )
    );
  };

  const updateItemReport = (itemId: string, updatedData: Partial<ItemReport>) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, ...updatedData, updatedAt: new Date().toISOString() }
          : i
      )
    );
  };

  const deleteItemReport = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setMatches((prev) =>
      prev.filter((m) => m.lostItemId !== itemId && m.foundItemId !== itemId)
    );
  };

  return (
    <AppStoreContext.Provider
      value={{
        currentUser,
        items,
        matches,
        claims,
        messages,
        notifications,
        unreadNotificationCount,

        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedType,
        setSelectedType,
        selectedStatus,
        setSelectedStatus,
        selectedColor,
        setSelectedColor,
        selectedVenue,
        setSelectedVenue,

        reportModalOpen,
        setReportModalOpen,
        reportType,
        setReportType,
        selectedItemDetail,
        setSelectedItemDetail,
        visualSearchModalOpen,
        setVisualSearchModalOpen,
        qrModalItem,
        setQrModalItem,
        claimModalItem,
        setClaimModalItem,
        activeChatConvId,
        setActiveChatConvId,

        addItemReport,
        runAiMatchForItem,
        runGlobalAiMatching,
        submitClaimAnswers,
        sendMessage,
        markNotificationRead,
        markAllNotificationsRead,
        updateItemStatus,
        updateItemReport,
        deleteItemReport,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}
