export type ItemCategory =
  | 'Electronics'
  | 'Wallets & Bags'
  | 'ID Cards & Documents'
  | 'Keys'
  | 'Jewelry & Watches'
  | 'Clothing & Accessories'
  | 'Pets'
  | 'Books & Stationery'
  | 'Other';

export type ItemType = 'LOST' | 'FOUND';

export type ItemStatus = 'ACTIVE' | 'PENDING_MATCH' | 'CLAIMED' | 'RETURNED' | 'EXPIRED';

export type ItemCondition = 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'UNSPECIFIED';

export interface ItemLocation {
  venue: string;          // e.g. "Main University Library", "Terminal 2 Gate B", "Grand Central Station"
  areaDetail?: string;    // e.g. "3rd Floor Study Desk #14", "Security Guard Counter"
  city?: string;          // e.g. "New York, NY", "Chicago, IL"
  latitude?: number;
  longitude?: number;
}

export interface UserReporter {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  role: 'user' | 'admin' | 'finder' | 'owner';
}

export interface ItemReport {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory;
  primaryColor: string;
  secondaryColor?: string;
  brand?: string;
  dateReported: string;     // ISO String
  dateOccurred: string;     // ISO String (when lost or found)
  location: ItemLocation;
  images: string[];          // Data URLs or image paths
  ocrText?: string;          // Text extracted from photo (e.g. ID card name, serial number)
  aiTags?: string[];
  rewardAmount?: number;
  status: ItemStatus;
  reporter: UserReporter;
  custodyLocation?: string;  // For FOUND items (e.g. "Campus Security Locker #B-12")
  verificationQuestions?: string[];
  qrCodeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMatchBreakdown {
  visualDetails: string;
  textOcrDetails: string;
  locationTimeDetails: string;
  colorAttributeDetails: string;
}

export interface AIMatchResult {
  id: string;
  lostItemId: string;
  foundItemId: string;
  matchScore: number;       // 0 to 100
  overallVerdict: 'HIGH_MATCH' | 'MEDIUM_MATCH' | 'LOW_MATCH';
  visualSimilarityScore: number;
  textSimilarityScore: number;
  locationScore: number;
  colorScore: number;
  aiReasoning: string;
  breakdown: AIMatchBreakdown;
  status: 'SUGGESTED' | 'VERIFIED' | 'REJECTED' | 'CLAIMED';
  createdAt: string;
}

export interface ClaimRequest {
  id: string;
  matchId?: string;
  lostItemId: string;
  foundItemId: string;
  claimantUserId: string;
  claimantName: string;
  claimantEmail: string;
  status: 'PENDING_QUIZ' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  answers: Record<string, string>;
  verificationNotes?: string;
  aiVerificationScore?: number;
  aiVerificationFeedback?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'finder' | 'admin';
  text: string;
  attachments?: string[];
  timestamp: string;
  isSystem?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'MATCH_FOUND' | 'CLAIM_UPDATE' | 'NEW_MESSAGE' | 'ITEM_RETURNED' | 'SYSTEM';
  relatedItemId?: string;
  relatedMatchId?: string;
  read: boolean;
  createdAt: string;
}

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'finder' | 'admin';
  avatar: string;
  title: string;
}

export interface AIAnalysisResponse {
  suggestedTitle: string;
  category: ItemCategory;
  primaryColor: string;
  secondaryColor?: string;
  brand?: string;
  extractedOcrText?: string;
  aiTags: string[];
  summaryDescription: string;
  suggestedVerificationQuestions: string[];
  isSensitiveDocument: boolean;
}
