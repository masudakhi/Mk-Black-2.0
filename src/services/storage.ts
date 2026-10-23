import {
  UserWallet,
  Transaction,
  AdCampaign,
  LivePayout,
  UserProfile,
  AdminBankAccount,
  AdminLedgerItem,
  PlatformSettings,
} from '../types';

export const ADMIN_EMAIL = 'mafizuli83@gmail.com';

const USER_KEY = 'takacash_current_user_v2';
const WALLET_KEY = 'takacash_wallet_v2';
const TRANSACTIONS_KEY = 'takacash_transactions_v2';
const LAST_CHECKIN_KEY = 'takacash_last_checkin_v2';
const ADMIN_BANK_KEY = 'takacash_admin_bank_v2';
const ADMIN_LEDGER_KEY = 'takacash_admin_ledger_v2';
const PLATFORM_SETTINGS_KEY = 'takacash_platform_settings_v2';
const USER_DAILY_EARNINGS_KEY = 'takacash_daily_earnings_log_v2';

const INITIAL_WALLET: UserWallet = {
  taka: 35.0, // Initial welcome bonus in Taka
  coins: 450, // 450 coins = 4.5 Taka
  totalWithdrawn: 100.0,
  todayEarned: 15.0,
  adsWatchedToday: 3,
  gamesPlayedToday: 2,
  streakDays: 4,
  referralCode: 'BD' + Math.floor(100000 + Math.random() * 900000),
  referralCount: 3,
  referralEarnings: 30.0,
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_init_1',
    trxId: 'BK' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    method: 'bkash',
    accountNumber: '01712***456',
    amount: 50,
    fee: 0,
    netAmount: 50,
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
  },
  {
    id: 'tx_init_2',
    trxId: 'NG' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    method: 'nagad',
    accountNumber: '01923***789',
    amount: 50,
    fee: 0,
    netAmount: 50,
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 42, // 42 hours ago
  },
];

export const AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'ad_daraz',
    title: 'দারাজ মেগা সেল - ৭০% পর্যন্ত ডিসকাউন্ট!',
    sponsor: 'Daraz Bangladesh',
    tagline: 'বাংলাদেশের সবচেয়ে বড় অনলাইন শপিং উৎসব শুরু হয়েছে। এখনি অর্ডার করুন!',
    duration: 15,
    rewardTaka: 3.5,
    rewardCoins: 50,
    category: 'video',
    badge: 'সেরা অফার',
    videoThumbnail: '🛍️',
    themeColor: 'from-orange-600 to-amber-700',
    callToAction: 'অফার দেখুন',
    accent: '#f85606',
  },
  {
    id: 'ad_bkash',
    title: 'বিকাশ ডিজিটাল সেভিংস - আকর্ষণীয় মুনাফা!',
    sponsor: 'bKash Limited',
    tagline: 'ঘরে বসেই আইডিএলসি ও ব্র্যাক ব্যাংকে ডিজিটাল ডিপিএস করুন মাত্র ৫০০ টাকা থেকে।',
    duration: 20,
    rewardTaka: 5.0,
    rewardCoins: 75,
    category: 'video',
    badge: 'হাই পেয়িং',
    videoThumbnail: '💸',
    themeColor: 'from-pink-600 to-rose-700',
    callToAction: 'বিস্তারিত জানুন',
    accent: '#e2136e',
  },
  {
    id: 'ad_nagad',
    title: 'নগদ ইসলামিক অ্যাকাউন্ট - সম্পূর্ণ সুদবিহীন লেনদেন',
    sponsor: 'Nagad Digital',
    tagline: 'শরীয়াহ সম্মত ইসলামিক অ্যাকাউন্টে কোনো সার্ভিস চার্জ নেই। এখনই খুলুন!',
    duration: 15,
    rewardTaka: 3.0,
    rewardCoins: 40,
    category: 'video',
    badge: 'জনপ্রিয়',
    videoThumbnail: '🌙',
    themeColor: 'from-amber-600 to-orange-700',
    callToAction: 'একাউন্ট খুলুন',
    accent: '#f7941d',
  },
  {
    id: 'ad_foodpanda',
    title: 'ফুডপ্যান্ডা ফ্রি ডেলিভারি ও ১০০ টাকা ভাউচার',
    sponsor: 'foodpanda BD',
    tagline: 'প্রথম অর্ডারে FP100 কোড ব্যবহার করে নিন নিশ্চিত ১০০ টাকা ক্যাশব্যাক।',
    duration: 12,
    rewardTaka: 2.5,
    rewardCoins: 35,
    category: 'video',
    badge: 'ফাস্ট পে',
    videoThumbnail: '🍔',
    themeColor: 'from-pink-500 to-fuchsia-600',
    callToAction: 'ফুড অর্ডার করুন',
    accent: '#d70f64',
  },
  {
    id: 'ad_pathao',
    title: 'পাঠাও রাইড ও পার্সেল সুপার ডিসকাউন্ট',
    sponsor: 'Pathao Limited',
    tagline: 'জ্যামের শহরে দ্রুত গন্তব্যে পৌঁছান পাঠাও বাইক অথবা কারে।',
    duration: 18,
    rewardTaka: 4.0,
    rewardCoins: 60,
    category: 'interactive',
    badge: 'বোনাস টাস্ক',
    videoThumbnail: '🛵',
    themeColor: 'from-red-600 to-rose-800',
    callToAction: 'রাইড বুক করুন',
    accent: '#eb2c29',
  },
  {
    id: 'ad_gp',
    title: 'গ্রামীনফোন মাইজিপি অ্যাপ - এক্সক্লুসিভ ৫জিবি ডেটা অফার',
    sponsor: 'Grameenphone',
    tagline: 'মাইজিপি অ্যাপ ইন্সটল করলেই পাচ্ছেন ফ্রি ইন্টারনেট বোনাস পয়েন্ট।',
    duration: 15,
    rewardTaka: 3.0,
    rewardCoins: 45,
    category: 'web_visit',
    badge: 'সহজ টাস্ক',
    videoThumbnail: '📶',
    themeColor: 'from-blue-600 to-cyan-700',
    callToAction: 'অ্যাপ দেখুন',
    accent: '#00a3e0',
  },
];

export const INITIAL_LIVE_PAYOUTS: LivePayout[] = [
  { id: 'lp1', userPhone: '017****291', method: 'bkash', amount: 150, city: 'Dhaka', timeAgo: '২ মিনিট আগে' },
  { id: 'lp2', userPhone: '018****843', method: 'nagad', amount: 100, city: 'Chittagong', timeAgo: '৪ মিনিট আগে' },
  { id: 'lp3', userPhone: '019****512', method: 'rocket', amount: 200, city: 'Sylhet', timeAgo: '৭ মিনিট আগে' },
  { id: 'lp4', userPhone: '016****098', method: 'recharge', amount: 50, city: 'Rajshahi', timeAgo: '১১ মিনিট আগে' },
  { id: 'lp5', userPhone: '013****772', method: 'bkash', amount: 500, city: 'Khulna', timeAgo: '১৪ মিনিট আগে' },
  { id: 'lp6', userPhone: '017****634', method: 'nagad', amount: 50, city: 'Gazipur', timeAgo: '১৮ মিনিট আগে' },
];

export function getStoredUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('User storage read error', e);
  }
  return null;
}

export function saveUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.warn('User storage write error', e);
  }
}

export function getStoredWallet(): UserWallet {
  try {
    const data = localStorage.getItem(WALLET_KEY);
    if (data) {
      return { ...INITIAL_WALLET, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn('Storage read error', e);
  }
  return INITIAL_WALLET;
}

export function saveWallet(wallet: UserWallet): void {
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  } catch (e) {
    console.warn('Storage write error', e);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Storage read error', e);
  }
  return INITIAL_TRANSACTIONS;
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.warn('Storage write error', e);
  }
}

export function canCheckinToday(): boolean {
  try {
    const lastDate = localStorage.getItem(LAST_CHECKIN_KEY);
    const today = new Date().toDateString();
    return lastDate !== today;
  } catch {
    return true;
  }
}

export function markCheckinDone(): void {
  try {
    localStorage.setItem(LAST_CHECKIN_KEY, new Date().toDateString());
  } catch (e) {
    console.warn(e);
  }
}

export const INITIAL_ADMIN_BANK: AdminBankAccount = {
  bankName: 'ডাচ-বাংলা ব্যাংক লিমিটেড (DBBL)',
  accountName: 'Mafizul Islam (Master Admin)',
  accountNumber: '115.120.489201',
  branchName: 'ঢাকা প্রিন্সিপাল কর্পোরেট শাখা',
  routingNumber: '090271829',
  balance: 28450.0,
};

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  dailyUserEarningCap: 100, // গ্রাহক সারাদিনে সর্বোচ্চ ১০০ টাকা আয় করতে পারবে
  newUserBonus: 100, // নতুন ইউজার ১০০ টাকা ওয়েলকাম বোনাস পাবে
  userAdSharePercent: 50, // অ্যাড রেভিনিউ: ৫০% ইউজার পাবে
  adminAdSharePercent: 50, // অ্যাড রেভিনিউ: ৫০% এডমিন ব্যাংক একাউন্টে জমা হবে
  referralUserBonus: 20, // রেফারেল: ইউজার পাবে ২০ টাকা
  referralAdminCut: 10, // রেফারেল: এডমিন একাউন্টে ১০ টাকা আসবে
};

export const INITIAL_ADMIN_LEDGER: AdminLedgerItem[] = [
  {
    id: 'ledg_1',
    type: 'ad_split_50',
    sourceUser: '01712***891',
    amount: 2.5,
    description: 'দারাজ ভিডিও অ্যাড রেভিনিউ স্প্লিট (৫০%)',
    timestamp: Date.now() - 1000 * 60 * 12,
  },
  {
    id: 'ledg_2',
    type: 'referral_cut',
    sourceUser: '01845***224',
    amount: 10.0,
    description: 'ইউজার রেফারেল শেয়ার কমিশন (১০ ৳)',
    timestamp: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'ledg_3',
    type: 'ad_split_50',
    sourceUser: '01911***567',
    amount: 1.5,
    description: 'ফুডপ্যান্ডা অ্যাড রেভিনিউ স্প্লিট (৫০%)',
    timestamp: Date.now() - 1000 * 60 * 95,
  },
];

export function isAdminUser(user: UserProfile | null): boolean {
  if (!user) return false;
  return (
    user.identifier.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() ||
    user.role === 'admin'
  );
}

export function getStoredAdminBank(): AdminBankAccount {
  try {
    const data = localStorage.getItem(ADMIN_BANK_KEY);
    if (data) return { ...INITIAL_ADMIN_BANK, ...JSON.parse(data) };
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_ADMIN_BANK;
}

export function saveAdminBank(bank: AdminBankAccount): void {
  try {
    localStorage.setItem(ADMIN_BANK_KEY, JSON.stringify(bank));
  } catch (e) {
    console.warn(e);
  }
}

export function getStoredAdminLedger(): AdminLedgerItem[] {
  try {
    const data = localStorage.getItem(ADMIN_LEDGER_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_ADMIN_LEDGER;
}

export function addAdminLedgerEntry(
  entry: Omit<AdminLedgerItem, 'id' | 'timestamp'>
): void {
  try {
    const list = getStoredAdminLedger();
    const newItem: AdminLedgerItem = {
      ...entry,
      id: 'ledg_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: Date.now(),
    };
    const updated = [newItem, ...list.slice(0, 49)];
    localStorage.setItem(ADMIN_LEDGER_KEY, JSON.stringify(updated));

    // Also auto-credit to Admin Bank Balance
    const bank = getStoredAdminBank();
    bank.balance += entry.amount;
    saveAdminBank(bank);
  } catch (e) {
    console.warn(e);
  }
}

export function getStoredPlatformSettings(): PlatformSettings {
  try {
    const data = localStorage.getItem(PLATFORM_SETTINGS_KEY);
    if (data) return { ...INITIAL_PLATFORM_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_PLATFORM_SETTINGS;
}

export function savePlatformSettings(settings: PlatformSettings): void {
  try {
    localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn(e);
  }
}

// User daily earning log map: { [userId_dateString]: number }
export function getUserTodayEarned(userId: string): number {
  try {
    const today = new Date().toDateString();
    const key = `${userId}_${today}`;
    const raw = localStorage.getItem(USER_DAILY_EARNINGS_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      return map[key] || 0;
    }
  } catch (e) {
    console.warn(e);
  }
  return 0;
}

export function recordUserEarned(
  userId: string,
  attemptedAmount: number,
  dailyCap = 100
): { allowedAmount: number; reachedCap: boolean; remainingToday: number } {
  try {
    const today = new Date().toDateString();
    const key = `${userId}_${today}`;
    const raw = localStorage.getItem(USER_DAILY_EARNINGS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const currentToday = map[key] || 0;

    const availableLimit = Math.max(0, dailyCap - currentToday);
    const allowed = Math.min(attemptedAmount, availableLimit);

    const newTotal = currentToday + allowed;
    map[key] = newTotal;
    localStorage.setItem(USER_DAILY_EARNINGS_KEY, JSON.stringify(map));

    return {
      allowedAmount: allowed,
      reachedCap: newTotal >= dailyCap,
      remainingToday: Math.max(0, dailyCap - newTotal),
    };
  } catch (e) {
    console.warn(e);
    return {
      allowedAmount: attemptedAmount,
      reachedCap: false,
      remainingToday: dailyCap,
    };
  }
}

