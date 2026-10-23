import React, { useState, useEffect } from 'react';
import {
  Coins,
  Wallet,
  Play,
  Flame,
  Gift,
  Sparkles,
  Trophy,
  Users,
  History,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Gamepad2,
  Video,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { PaymentTicker } from './components/PaymentTicker';
import { TakaCatcherGame } from './components/TakaCatcherGame';
import { SpinWheel } from './components/SpinWheel';
import { ScratchCard } from './components/ScratchCard';
import { MathQuiz } from './components/MathQuiz';
import { WatchAdsModal } from './components/WatchAdsModal';
import { WithdrawModal } from './components/WithdrawModal';
import { TransactionSlipModal } from './components/TransactionSlipModal';
import { CoinConvertModal } from './components/CoinConvertModal';
import { ReferralTab } from './components/ReferralTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { HistoryTab } from './components/HistoryTab';
import { AuthScreen } from './components/AuthScreen';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminPanel } from './components/AdminPanel';

import {
  getStoredUser,
  saveUser,
  getStoredWallet,
  saveWallet,
  getStoredTransactions,
  saveTransactions,
  AD_CAMPAIGNS,
  canCheckinToday,
  markCheckinDone,
  ADMIN_EMAIL,
  isAdminUser,
  getStoredAdminBank,
  saveAdminBank,
  getStoredAdminLedger,
  addAdminLedgerEntry,
  getStoredPlatformSettings,
  savePlatformSettings,
  getUserTodayEarned,
  recordUserEarned,
} from './services/storage';
import { sound } from './services/sound';
import {
  AdCampaign,
  Language,
  Transaction,
  UserWallet,
  UserProfile,
  AdminBankAccount,
  AdminLedgerItem,
  PlatformSettings,
} from './types';
import confetti from 'canvas-confetti';

type ActiveTab = 'dashboard' | 'ads' | 'games' | 'wallet' | 'refer' | 'leaderboard';
type ActiveGame = 'none' | 'taka_rush' | 'spin_wheel' | 'scratch_card' | 'math_quiz';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [wallet, setWallet] = useState<UserWallet>(getStoredWallet);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);
  const [language, setLanguage] = useState<Language>('bn');
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeGame, setActiveGame] = useState<ActiveGame>('none');
  const [canCheckin, setCanCheckin] = useState(canCheckinToday);

  // Admin & Platform Settings State
  const [adminBank, setAdminBank] = useState<AdminBankAccount>(getStoredAdminBank);
  const [adminLedger, setAdminLedger] = useState<AdminLedgerItem[]>(getStoredAdminLedger);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(getStoredPlatformSettings);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Active Modals
  const [selectedAd, setSelectedAd] = useState<AdCampaign | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [showCoinConvertModal, setShowCoinConvertModal] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    saveWallet(wallet);
  }, [wallet]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Handle Sound Toggle
  const handleSoundToggle = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playClick();
    }
  };

  // Daily Checkin Claim
  const handleDailyCheckin = () => {
    if (!canCheckin) {
      sound.playClick();
      alert('আপনি আজকের দৈনিক বোনাস ইতোমধ্যে সংগ্রহ করেছেন! আগামীকাল আবার আসুন।');
      return;
    }

    sound.playCash();
    markCheckinDone();
    setCanCheckin(false);

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const bonusTaka = 5.0; // 5 Tk daily bonus
    const bonusCoins = 50;

    setWallet(prev => ({
      ...prev,
      taka: prev.taka + bonusTaka,
      coins: prev.coins + bonusCoins,
      todayEarned: prev.todayEarned + bonusTaka,
      streakDays: prev.streakDays + 1,
    }));

    alert('🎉 অভিনন্দন! দৈনিক চেক-ইন বোনাস ৳৫.০০ টাকা ও ৫০ কয়েন আপনার ওয়ালেটে যুক্ত হয়েছে!');
  };

  // Rewarded Ad watched: 50% to User (subject to 100 Tk daily cap) + 50% automatically to Admin Bank Account
  const handleAdReward = (fullAdTaka: number, coins: number) => {
    if (!currentUser) return;

    // 50% split logic
    const userAdCut = parseFloat(((fullAdTaka * platformSettings.userAdSharePercent) / 100).toFixed(2));
    const adminAdCut = parseFloat(((fullAdTaka * platformSettings.adminAdSharePercent) / 100).toFixed(2));

    // Daily 100 Tk Earning Cap Check for User
    const { allowedAmount, reachedCap, remainingToday } = recordUserEarned(
      currentUser.id,
      userAdCut,
      platformSettings.dailyUserEarningCap
    );

    if (allowedAmount > 0) {
      setWallet(prev => ({
        ...prev,
        taka: prev.taka + allowedAmount,
        coins: prev.coins + coins,
        todayEarned: prev.todayEarned + allowedAmount,
        adsWatchedToday: prev.adsWatchedToday + 1,
      }));
    }

    // Auto-deposit 50% cut to Admin Bank Account
    addAdminLedgerEntry({
      type: 'ad_split_50',
      sourceUser: currentUser.identifier,
      amount: adminAdCut,
      description: `বিজ্ঞাপন রেভিনিউ শেয়ার (${platformSettings.adminAdSharePercent}%)`,
    });
    setAdminBank(getStoredAdminBank());
    setAdminLedger(getStoredAdminLedger());

    if (reachedCap) {
      alert(`⚠️ আজকের ৳${platformSettings.dailyUserEarningCap} টাকার সর্বোচ্চ আয়ের সীমা পূর্ণ হয়েছে! আজকের বাকি বিজ্ঞাপন থেকে ইউজার একাউন্টে টাকা যোগ হবে না (এডমিন ব্যাংক একাউন্টে রেভিনিউ জমা অব্যাহত থাকবে)।`);
    }
  };

  // Game over earnings (subject to 100 Tk daily cap)
  const handleGameEarn = (taka: number, coins: number) => {
    if (!currentUser) return;

    const { allowedAmount, reachedCap } = recordUserEarned(
      currentUser.id,
      taka,
      platformSettings.dailyUserEarningCap
    );

    if (allowedAmount > 0) {
      setWallet(prev => ({
        ...prev,
        taka: prev.taka + allowedAmount,
        coins: prev.coins + coins,
        todayEarned: prev.todayEarned + allowedAmount,
        gamesPlayedToday: prev.gamesPlayedToday + 1,
      }));
    }

    if (reachedCap) {
      alert(`⚠️ আজকের ৳${platformSettings.dailyUserEarningCap} টাকার আয়ের সীমা পূর্ণ হয়েছে! আগামীকাল আবার গেম খেলে আয় করতে পারবেন।`);
    }
  };

  // Coins converted to Taka
  const handleConvertCoins = (coinsConverted: number, takaEarned: number) => {
    setWallet(prev => ({
      ...prev,
      coins: Math.max(0, prev.coins - coinsConverted),
      taka: prev.taka + takaEarned,
      todayEarned: prev.todayEarned + takaEarned,
    }));
    setShowCoinConvertModal(false);
  };

  // Withdrawal Confirmed
  const handleWithdrawalSuccess = (newTx: Transaction) => {
    setWallet(prev => ({
      ...prev,
      taka: Math.max(0, prev.taka - newTx.amount),
      totalWithdrawn: prev.totalWithdrawn + newTx.amount,
    }));
    setTransactions(prev => [newTx, ...prev]);
    setShowWithdrawModal(false);
    setSelectedReceipt(newTx);
  };

  // Referral Action: User gets 20 Tk + Admin Bank Account gets 10 Tk
  const handleSimulateReferral = () => {
    if (!currentUser) return;
    const userBonus = platformSettings.referralUserBonus; // 20 Tk
    const adminCut = platformSettings.referralAdminCut; // 10 Tk

    // User gets 20 Tk
    setWallet(prev => ({
      ...prev,
      taka: prev.taka + userBonus,
      todayEarned: prev.todayEarned + userBonus,
      referralCount: prev.referralCount + 1,
      referralEarnings: prev.referralEarnings + userBonus,
    }));

    // Admin Bank gets 10 Tk automatically
    addAdminLedgerEntry({
      type: 'referral_cut',
      sourceUser: currentUser.identifier,
      amount: adminCut,
      description: `রেফারেল কমিশন অটো ডিপোজিট (${adminCut} ৳)`,
    });
    setAdminBank(getStoredAdminBank());
    setAdminLedger(getStoredAdminLedger());
  };

  // Auth Handlers: New users get 100 Tk welcome bonus
  const handleAuthSuccess = (user: UserProfile, isNewUser: boolean, referralBonusApplied: boolean) => {
    setCurrentUser(user);
    saveUser(user);

    if (isNewUser) {
      // New user gets 100 Tk bonus
      let welcomeBonus = platformSettings.newUserBonus; // 100 Tk
      let welcomeCoins = 100;

      if (referralBonusApplied) {
        // Extra 20 Tk if referred
        welcomeBonus += platformSettings.referralUserBonus; // +20 Tk
        // Admin gets 10 Tk
        addAdminLedgerEntry({
          type: 'referral_cut',
          sourceUser: user.identifier,
          amount: platformSettings.referralAdminCut,
          description: 'নতুন রেফারেল ইউজার জয়েনিং কমিশন',
        });
        setAdminBank(getStoredAdminBank());
        setAdminLedger(getStoredAdminLedger());
      }

      setWallet(prev => ({
        ...prev,
        taka: prev.taka + welcomeBonus,
        coins: prev.coins + welcomeCoins,
        todayEarned: prev.todayEarned + welcomeBonus,
      }));

      alert(`🎉 স্বাগতম ${user.name}! আপনার অ্যাকাউন্টে নতুন ইউজার হিসেবে ৳${welcomeBonus.toFixed(2)} টাকা সাইনআপ ওয়েলকাম বোনাস দেওয়া হয়েছে!`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveUser(null);
    setShowProfileModal(false);
    setShowAdminPanel(false);
    sound.playClick();
  };

  const handleUpdatePlatformSettings = (newSettings: PlatformSettings) => {
    setPlatformSettings(newSettings);
    savePlatformSettings(newSettings);
  };

  const handleUpdateAdminBank = (newBank: AdminBankAccount) => {
    setAdminBank(newBank);
    saveAdminBank(newBank);
  };

  // Enforce Sign In Gate when entering the app
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // If a full-screen game is currently active, render dedicated game view
  if (activeGame === 'taka_rush') {
    return (
      <div className="min-h-screen bg-[#070b13] p-2 sm:p-6 flex flex-col justify-center items-center">
        <TakaCatcherGame
          onGameOverEarn={handleGameEarn}
          onExit={() => setActiveGame('none')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        taka={wallet.taka}
        coins={wallet.coins}
        streakDays={wallet.streakDays}
        language={language}
        onLanguageToggle={() => setLanguage(l => (l === 'bn' ? 'en' : 'bn'))}
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
        onOpenWithdraw={() => {
          sound.playClick();
          setShowWithdrawModal(true);
        }}
        onConvertCoins={() => {
          sound.playClick();
          setShowCoinConvertModal(true);
        }}
        onCheckinClick={handleDailyCheckin}
        canCheckin={canCheckin}
        onOpenProfile={() => {
          sound.playClick();
          setShowProfileModal(true);
        }}
        onOpenAdmin={() => {
          sound.playCash();
          setShowAdminPanel(true);
        }}
      />

      {/* Live MFS Payment Proof Ticker */}
      <PaymentTicker />

      {/* Navigation Tab Bar */}
      <nav className="bg-slate-900/60 border-b border-slate-800/80 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between sm:justify-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {[
            { id: 'dashboard', labelBn: 'হোম ড্যাশবোর্ড', labelEn: 'Dashboard', icon: Wallet },
            { id: 'ads', labelBn: 'অ্যাড দেখুন (ভিডিও)', labelEn: 'Watch Ads', icon: Video },
            { id: 'games', labelBn: 'গেম খেলুন ও আয়', labelEn: 'Play Games', icon: Gamepad2 },
            { id: 'wallet', labelBn: 'টাকা উত্তোলন', labelEn: 'Withdraw MFS', icon: Coins },
            { id: 'refer', labelBn: 'রেফার প্রোগ্রাম', labelEn: 'Refer & Earn', icon: Users },
            { id: 'leaderboard', labelBn: 'টপ আর্নার', labelEn: 'Leaderboard', icon: Trophy },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as ActiveTab);
                  setActiveGame('none');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {/* Active Mini Game Sub-View */}
        {activeGame === 'spin_wheel' && (
          <div className="mb-8">
            <SpinWheel
              onReward={handleGameEarn}
              onWatchAdForSpin={() => {
                const randomAd = AD_CAMPAIGNS[Math.floor(Math.random() * AD_CAMPAIGNS.length)];
                setSelectedAd(randomAd);
              }}
              onExit={() => setActiveGame('none')}
            />
          </div>
        )}

        {activeGame === 'scratch_card' && (
          <div className="mb-8">
            <ScratchCard
              onReward={handleGameEarn}
              onWatchAdForCard={() => {
                const randomAd = AD_CAMPAIGNS[Math.floor(Math.random() * AD_CAMPAIGNS.length)];
                setSelectedAd(randomAd);
              }}
              onExit={() => setActiveGame('none')}
            />
          </div>
        )}

        {activeGame === 'math_quiz' && (
          <div className="mb-8">
            <MathQuiz
              onReward={handleGameEarn}
              onExit={() => setActiveGame('none')}
            />
          </div>
        )}

        {/* Tab 1: Dashboard / Home */}
        {activeTab === 'dashboard' && activeGame === 'none' && (
          <div className="space-y-6">
            {/* Hero Quick Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-5 sm:p-7 shadow-2xl overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>১০০% বিশ্বস্ত বাংলাদেশি ক্যাশ আর্নিং প্ল্যাটফর্ম</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    বিজ্ঞাপন দেখুন, গেম খেলুন ও <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                      বিকাশ, নগদ ও রকেটে সরাসরি টাকা নিন!
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
                    প্রতিটি বিজ্ঞাপন দেখার জন্য পাবেন সরাসরি ক্যাশ টাকা অথবা কয়েন। মাত্র ৫০ টাকা হলেই বিকাশ বা নগদে তুলে নিন মুহূর্তে।
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-5">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('ads');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                    >
                      <Video className="w-4 h-4 fill-slate-950" />
                      <span>ভিডিও অ্যাড দেখুন</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveGame('taka_rush');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4 fill-slate-950" />
                      <span>টাকা রাশ গেম খেলুন</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setShowWithdrawModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-pink-600/30 hover:bg-pink-600/40 text-pink-300 border border-pink-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>ক্যাশআউট করুন</span>
                    </button>
                  </div>
                </div>

                {/* Daily Checkin Widget */}
                <div className="w-full md:w-72 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shrink-0 shadow-lg text-center flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>দৈনিক স্ট্রিক</span>
                    </span>
                    <span className="font-bold text-amber-300">{wallet.streakDays} দিন</span>
                  </div>

                  <div className="my-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mx-auto mb-2">
                      🎁
                    </div>
                    <div className="text-sm font-bold text-white">দৈনিক চেক-ইন বোনাস</div>
                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">+৳৫.০০ টাকা ও ৫০ কয়েন</div>
                  </div>

                  <button
                    onClick={handleDailyCheckin}
                    disabled={!canCheckin}
                    className={`mt-3 w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      canCheckin
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    {canCheckin ? 'আজকের বোনাস গ্রহণ করুন' : 'আজকের বোনাস নেওয়া হয়েছে ✅'}
                  </button>
                </div>
              </div>
            </div>

            {/* Master Admin Hidden Quick Access Banner - ONLY visible to mafizuli83@gmail.com */}
            {isAdminUser(currentUser) && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/80 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-lg">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">মাস্টার এডমিন অ্যাক্টিভ</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        গোপন প্যানেল
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      ব্যাংক ভল্ট: <strong className="text-emerald-400 font-mono">৳ {adminBank.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> • অটো ৫০% অ্যাড রেভিনিউ ডিপোজিট সক্রিয়
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playCash();
                    setShowAdminPanel(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  এডমিন প্যানেল ওপেন করুন →
                </button>
              </div>
            )}

            {/* Daily User Earning Limit Bar (১০০ টাকা সীমা) */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="text-xs font-bold text-slate-200">
                    সারাদিনে সর্বোচ্চ আয়ের সীমা (Daily Limit):
                  </span>
                  <span className="text-xs font-black text-amber-300 font-mono">
                    ৳{platformSettings.dailyUserEarningCap} টাকা
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  {wallet.todayEarned >= platformSettings.dailyUserEarningCap ? (
                    <span className="text-rose-400 font-bold">
                      ✓ আজকের ১০০ টাকার সর্বোচ্চ কোটা পূর্ণ হয়েছে!
                    </span>
                  ) : (
                    <span>
                      আজ আরও আয় করতে পারবেন:{' '}
                      <strong className="text-emerald-400 font-mono">
                        ৳{(platformSettings.dailyUserEarningCap - wallet.todayEarned).toFixed(2)} টাকা
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    wallet.todayEarned >= platformSettings.dailyUserEarningCap
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (wallet.todayEarned / platformSettings.dailyUserEarningCap) * 100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Quick Wallet Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black text-lg shrink-0">
                  ৳
                </div>
                <div>
                  <div className="text-xs text-slate-400">উত্তোলনযোগ্য ব্যালেন্স</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums">
                    ৳ {wallet.taka.toFixed(2)}
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  sound.playClick();
                  setShowCoinConvertModal(true);
                }}
                className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer group flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                  <Coins className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 group-hover:text-amber-300 flex items-center gap-1">
                    <span>মোট কয়েন</span>
                    <span className="text-[10px] text-amber-400">↻ রূপান্তর</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-amber-300 tabular-nums">
                    {wallet.coins.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">আজকের মোট আয়</div>
                  <div className="text-lg sm:text-xl font-black text-teal-300 tabular-nums">
                    ৳ {wallet.todayEarned.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">মোট উত্তোলন সম্পন্ন</div>
                  <div className="text-lg sm:text-xl font-black text-purple-300 tabular-nums">
                    ৳ {wallet.totalWithdrawn.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Game Arena Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-black text-white">গেম জোন (খেলে আয় করুন)</h2>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('games');
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <span>সব গেম দেখুন</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Game 1: Taka Rush */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setActiveGame('taka_rush');
                  }}
                  className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all hover:scale-102 cursor-pointer shadow-md group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                    💰
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-white">টাকা রাশ (Taka Rush)</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                      পপুলার
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    পড়ন্ত বিকাশ-নগদ ক্যাশ নোট কুড়ান এবং স্কোর অনুযায়ী আয় করুন।
                  </p>
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                    <span>আয়: ৳২ - ৳১০</span>
                    <span className="text-slate-500 group-hover:text-emerald-400">খেলুন →</span>
                  </div>
                </div>

                {/* Game 2: Lucky Wheel */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setActiveGame('spin_wheel');
                  }}
                  className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all hover:scale-102 cursor-pointer shadow-md group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                    🎡
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-white">ভাগ্য চাকা (Spin & Win)</h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      জ্যাকপট
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    চাকা ঘুরিয়ে প্রতি স্পিনে নিশ্চিত নগদ টাকা অথবা ২০০ কয়েন জিতুন।
                  </p>
                  <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                    <span>আয়: ৳১ - ৳২০</span>
                    <span className="text-slate-500 group-hover:text-amber-400">ঘুরান →</span>
                  </div>
                </div>

                {/* Game 3: Scratch Card */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setActiveGame('scratch_card');
                  }}
                  className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-teal-500/50 transition-all hover:scale-102 cursor-pointer shadow-md group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                    ✨
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-white">স্ক্র্যাচ কার্ড (Scratch Card)</h3>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-bold">
                      সহজ
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    কার্ড ঘষে লুকিয়ে থাকা নগদ টাকা আনলক করে ওয়ালেটে যোগ করুন।
                  </p>
                  <div className="text-xs font-bold text-teal-400 flex items-center justify-between">
                    <span>আয়: ৳১.৫ - ৳৮</span>
                    <span className="text-slate-500 group-hover:text-teal-400">ঘষুন →</span>
                  </div>
                </div>

                {/* Game 4: Math Quiz */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setActiveGame('math_quiz');
                  }}
                  className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all hover:scale-102 cursor-pointer shadow-md group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                    🧮
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-white">গণিত কুইজ রাশ</h3>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                      দ্রুত
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    সহজ যোগ-বিয়োগের সঠিক উত্তর দিন এবং তাৎক্ষণিক বোনাস নিন।
                  </p>
                  <div className="text-xs font-bold text-cyan-400 flex items-center justify-between">
                    <span>আয়: ৳০.৫০ / প্রশ্ন</span>
                    <span className="text-slate-500 group-hover:text-cyan-400">কুইজ →</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Video Ads Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-pink-400" />
                  <h2 className="text-lg font-black text-white">বিজ্ঞাপন দেখে আয় (Featured Ads)</h2>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('ads');
                  }}
                  className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
                >
                  <span>সকল বিজ্ঞাপন ({AD_CAMPAIGNS.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AD_CAMPAIGNS.slice(0, 3).map(ad => (
                  <div
                    key={ad.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedAd(ad);
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:scale-101 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: ad.accent }}>
                          {ad.sponsor}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{ad.duration} সেকেন্ড</span>
                      </div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{ad.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ad.tagline}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-emerald-400 tabular-nums">
                          +৳{ad.rewardTaka.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-amber-300 font-semibold">
                          (+{ad.rewardCoins} কয়েন)
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Play className="w-3 h-3 fill-emerald-300" />
                        <span>দেখুন</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: All Ads (বিজ্ঞাপন দেখে আয়) */}
        {activeTab === 'ads' && activeGame === 'none' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center mx-auto mb-2 text-2xl">
                📺
              </div>
              <h2 className="text-2xl font-black text-white">ভিডিও ও স্পনসরড বিজ্ঞাপন দেখুন</h2>
              <p className="text-xs text-slate-400 mt-1">
                প্রতিটি বিজ্ঞাপন সম্পূর্ণ দেখে জিতে নিন নিশ্চিত নগদ টাকা এবং কয়েন বোনাস।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AD_CAMPAIGNS.map(ad => (
                <div
                  key={ad.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedAd(ad);
                  }}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:scale-102 cursor-pointer shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: ad.accent }}>
                        {ad.badge}
                      </span>
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {ad.duration}s ভিডিও
                      </span>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl mb-3 shadow">
                      {ad.videoThumbnail}
                    </div>

                    <div className="text-xs font-bold text-slate-400 mb-1">{ad.sponsor}</div>
                    <h3 className="font-extrabold text-base text-white leading-snug mb-2">{ad.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{ad.tagline}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">রিওয়ার্ড বোনাস:</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-emerald-400 tabular-nums">
                          ৳{ad.rewardTaka.toFixed(2)} টাকা
                        </span>
                        <span className="text-xs font-semibold text-amber-300">
                          (+{ad.rewardCoins})
                        </span>
                      </div>
                    </div>

                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>বিজ্ঞাপন দেখুন</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Games Arena (গেম খেলুন ও আয়) */}
        {activeTab === 'games' && activeGame === 'none' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 text-2xl">
                🎮
              </div>
              <h2 className="text-2xl font-black text-white">গেম এরিনা - খেলে ইনকাম করুন</h2>
              <p className="text-xs text-slate-400 mt-1">
                মজার মজার গেম খেলে পয়েন্ট ও রিয়েল ক্যাশ জিতে সরাসরি বিকাশ-নগদে তুলে নিন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Game Card 1 */}
              <div
                onClick={() => {
                  sound.playClick();
                  setActiveGame('taka_rush');
                }}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all hover:scale-101 cursor-pointer flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">💰</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ৬০ FPS আর্কেড গেম
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">টাকা রাশ (Taka Catcher Rush)</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    উপর থেকে দ্রুত বেগে বিকাশ, নগদ ও কয়েন পড়ছে। আপনার ওয়ালেট ব্যাগ ডানে-বামে সরিয়ে যত বেশি টাকা কুড়াতে পারবেন, তত বেশি ক্যাশ বোনাস পাবেন!
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-bold">রিওয়ার্ড: প্রতি গেমে ৳২ - ৳১০</span>
                  <button className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md">
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>খেলুন</span>
                  </button>
                </div>
              </div>

              {/* Game Card 2 */}
              <div
                onClick={() => {
                  sound.playClick();
                  setActiveGame('spin_wheel');
                }}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition-all hover:scale-101 cursor-pointer flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">🎡</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      লাকি হুইল
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">ভাগ্য চাকা (Spin & Win Lucky Wheel)</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    রিয়েল ফিজিক্স চাকা ঘুরিয়ে নগদ ক্যাশ টাকা ও কয়েন জিতুন। প্রতিদিন ফ্রি স্পিন এবং অতিরিক্ত বোনাস স্পিন রয়েছে।
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold">জ্যাকপট: সর্বোচ্চ ৳২০ টাকা</span>
                  <button className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md">
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>স্পিন করুন</span>
                  </button>
                </div>
              </div>

              {/* Game Card 3 */}
              <div
                onClick={() => {
                  sound.playClick();
                  setActiveGame('scratch_card');
                }}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/60 transition-all hover:scale-101 cursor-pointer flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">✨</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      ইনস্ট্যান্ট উইন
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">স্ক্র্যাচ অ্যান্ড উইন (Scratch Card)</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    স্ক্র্যাচ কার্ডের সিলভার ফয়েল ঘষে তাৎক্ষণিক রিওয়ার্ড আনলক করুন। সম্পূর্ণ রিয়েল টাইম ড্রাফট।
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-teal-400 font-bold">রিওয়ার্ড: ৳১.৫০ - ৳৮.০০</span>
                  <button className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md">
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>ঘষুন</span>
                  </button>
                </div>
              </div>

              {/* Game Card 4 */}
              <div
                onClick={() => {
                  sound.playClick();
                  setActiveGame('math_quiz');
                }}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 transition-all hover:scale-101 cursor-pointer flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">🧮</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      ব্রেন কুইজ
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">গণিত কুইজ রাশ (Math Quiz)</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    ১২ সেকেন্ডের মধ্যে সহজ গণিত সমীকরণ সমাধান করুন এবং প্রতি সঠিক উত্তরে ইনস্ট্যান্ট ক্যাশ যোগ করুন।
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-cyan-400 font-bold">আয়: প্রতি সমাধানে ৳০.৫০</span>
                  <button className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md">
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>কুইজ খেলুন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Wallet & Withdraw (টাকা উত্তোলন ও হিস্ট্রি) */}
        {activeTab === 'wallet' && activeGame === 'none' && (
          <div className="space-y-6">
            {/* Wallet Overview Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium">আপনার বর্তমান উত্তোলনযোগ্য ব্যালেন্স:</span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 tabular-nums">
                    ৳ {wallet.taka.toFixed(2)} টাকা
                  </div>
                  <div className="text-xs text-amber-300 mt-1">
                    কয়েন ব্যালেন্স: {wallet.coins.toLocaleString()} Coins (={ (wallet.coins / 100).toFixed(2) } ৳)
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowCoinConvertModal(true);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    কয়েন কনভার্ট করুন
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowWithdrawModal(true);
                    }}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:brightness-110 text-white font-black text-sm shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
                  >
                    সরাসরি ক্যাশআউট করুন
                  </button>
                </div>
              </div>
            </div>

            {/* Supported MFS Methods Showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E2136E] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  bKash
                </div>
                <div>
                  <div className="text-xs font-bold text-white">বিকাশ ট্রান্সফার</div>
                  <div className="text-[10px] text-slate-400">মিনিমাম ৳৫০</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7941D] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  নগদ
                </div>
                <div>
                  <div className="text-xs font-bold text-white">নগদ ট্রান্সফার</div>
                  <div className="text-[10px] text-slate-400">মিনিমাম ৳৫০</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8C3494] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  রকেট
                </div>
                <div>
                  <div className="text-xs font-bold text-white">রকেট ট্রান্সফার</div>
                  <div className="text-[10px] text-slate-400">মিনিমাম ৳৫০</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  Recharge
                </div>
                <div>
                  <div className="text-xs font-bold text-white">মোবাইল রিচার্জ</div>
                  <div className="text-[10px] text-slate-400">মিনিমাম ৳২০</div>
                </div>
              </div>
            </div>

            {/* Transactions History List */}
            <HistoryTab
              transactions={transactions}
              onSelectTransaction={tx => setSelectedReceipt(tx)}
              onOpenWithdraw={() => setShowWithdrawModal(true)}
            />
          </div>
        )}

        {/* Tab 5: Refer & Earn */}
        {activeTab === 'refer' && activeGame === 'none' && (
          <ReferralTab
            referralCode={wallet.referralCode}
            referralCount={wallet.referralCount}
            referralEarnings={wallet.referralEarnings}
            onSimulateReferral={handleSimulateReferral}
          />
        )}

        {/* Tab 6: Leaderboard */}
        {activeTab === 'leaderboard' && activeGame === 'none' && (
          <LeaderboardTab />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">টাকা ইনকাম প্রো (BD Earning App)</span>
            <span>•</span>
            <span>বিকাশ, নগদ, রকেট ও রিচার্জ পে-আউট সাপোর্ট</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>নিয়ম ও শর্তাবলী</span>
            <span>গোপনীয়তা নীতি</span>
            <span>সাহায্য ও সাপোর্ট</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedAd && (
        <WatchAdsModal
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
          onRewardClaim={(taka, coins) => {
            handleAdReward(taka, coins);
            setSelectedAd(null);
          }}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          currentTaka={wallet.taka}
          onClose={() => setShowWithdrawModal(false)}
          onConfirmWithdraw={handleWithdrawalSuccess}
        />
      )}

      {selectedReceipt && (
        <TransactionSlipModal
          transaction={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {showCoinConvertModal && (
        <CoinConvertModal
          currentCoins={wallet.coins}
          onClose={() => setShowCoinConvertModal(false)}
          onConvert={handleConvertCoins}
        />
      )}

      {showProfileModal && currentUser && (
        <UserProfileModal
          user={currentUser}
          wallet={wallet}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
        />
      )}

      {showAdminPanel && currentUser && isAdminUser(currentUser) && (
        <AdminPanel
          adminUser={currentUser}
          adminBank={adminBank}
          ledger={adminLedger}
          settings={platformSettings}
          transactions={transactions}
          onUpdateSettings={handleUpdatePlatformSettings}
          onUpdateBank={handleUpdateAdminBank}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  );
}
