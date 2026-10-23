export type Language = 'bn' | 'en';

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'recharge';

export interface UserProfile {
  id: string;
  name: string;
  identifier: string; // phone or email
  authType: 'phone' | 'email';
  role?: 'admin' | 'user';
  joinedAt: number;
  avatarSeed: string;
  hasClaimedWelcomeBonus?: boolean;
}

export interface AdminBankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  routingNumber: string;
  balance: number;
}

export interface AdminLedgerItem {
  id: string;
  type: 'ad_split_50' | 'referral_cut' | 'signup_pool' | 'bank_withdrawal';
  sourceUser: string;
  amount: number;
  description: string;
  timestamp: number;
}

export interface PlatformSettings {
  dailyUserEarningCap: number; // default 100 Tk
  newUserBonus: number; // default 100 Tk
  userAdSharePercent: number; // default 50%
  adminAdSharePercent: number; // default 50%
  referralUserBonus: number; // default 20 Tk
  referralAdminCut: number; // default 10 Tk
}

export interface Transaction {
  id: string;
  trxId: string;
  method: PaymentMethod;
  accountNumber: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  operator?: string; // for recharge: GP, Banglalink, Robi, Airtel, Teletalk
}

export interface AdCampaign {
  id: string;
  title: string;
  sponsor: string;
  tagline: string;
  duration: number; // in seconds
  rewardTaka: number;
  rewardCoins: number;
  category: 'video' | 'app_install' | 'web_visit' | 'interactive';
  badge: string;
  videoThumbnail: string;
  themeColor: string;
  callToAction: string;
  accent: string;
}

export interface UserWallet {
  taka: number;
  coins: number;
  totalWithdrawn: number;
  todayEarned: number;
  adsWatchedToday: number;
  gamesPlayedToday: number;
  streakDays: number;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
}

export interface LivePayout {
  id: string;
  userPhone: string;
  method: PaymentMethod;
  amount: number;
  city: string;
  timeAgo: string;
}
