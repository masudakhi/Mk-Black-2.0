import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  Sliders,
  Users,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Sparkles,
  RefreshCw,
  Coins,
  Video,
  ExternalLink,
  Edit3,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  AdminBankAccount,
  AdminLedgerItem,
  PlatformSettings,
  Transaction,
  UserProfile,
} from '../types';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface AdminPanelProps {
  adminUser: UserProfile;
  adminBank: AdminBankAccount;
  ledger: AdminLedgerItem[];
  settings: PlatformSettings;
  transactions: Transaction[];
  onUpdateSettings: (newSettings: PlatformSettings) => void;
  onUpdateBank: (newBank: AdminBankAccount) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  adminBank,
  ledger,
  settings,
  transactions,
  onUpdateSettings,
  onUpdateBank,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bank' | 'settings' | 'users' | 'ledger'>('overview');
  const [localSettings, setLocalSettings] = useState<PlatformSettings>(settings);
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  // Bank edit state
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState<AdminBankAccount>(adminBank);

  // Withdraw from admin bank
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCash();
    onUpdateSettings(localSettings);
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 3000);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCash();
    onUpdateBank(bankForm);
    setEditingBank(false);
  };

  const handleAdminBankWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > adminBank.balance) {
      sound.playHit();
      alert('সঠিক উত্তোলনের পরিমাণ লিখুন (ব্যালেন্সের মধ্যে হতে হবে)।');
      return;
    }

    sound.playCash();
    const updatedBank = {
      ...adminBank,
      balance: adminBank.balance - amt,
    };
    onUpdateBank(updatedBank);
    setWithdrawAmount('');
    setWithdrawSuccessMsg(`৳ ${amt.toLocaleString()} টাকা সফলভাবে আপনার ব্যাংক একাউন্টে ট্রান্সফার করা হয়েছে!`);
    setTimeout(() => setWithdrawSuccessMsg(''), 4000);

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        {/* Admin Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/90 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/10">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">মাস্টার এডমিন কন্ট্রোল প্যানেল</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  সুপার এডমিন
                </span>
              </div>
              <p className="text-xs text-amber-300/80 font-mono">
                {adminUser.identifier} • সম্পূর্ণ সুরক্ষিত ও সাধারণ ইউজার থেকে লুকানো
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-right">
              <span className="text-[10px] text-slate-400 block">এডমিন ব্যাংক ব্যালেন্স:</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 tabular-nums font-mono">
                ৳ {adminBank.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
            >
              বন্ধ করুন ✕
            </button>
          </div>
        </div>

        {/* Admin Subnav */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'overview', label: 'ওভারভিউ ও রেভিনিউ', icon: TrendingUp },
            { id: 'bank', label: 'এডমিন ব্যাংক একাউন্ট', icon: Building2 },
            { id: 'settings', label: 'লিমিট ও কমিশন কন্ট্রোল', icon: Sliders },
            { id: 'users', label: 'ইউজার ও আয়ের সীমা (১০০ ৳)', icon: Users },
            { id: 'ledger', label: '৫০% স্প্লিট লেজার হিস্ট্রি', icon: Wallet },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Highlights Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-emerald-950/50 border border-amber-500/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">এডমিন ব্যাংক ভল্ট:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      ৳ {adminBank.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-emerald-300/80 block mt-1">
                      ✓ ৫০% অ্যাড + রেফারেল অটো ডিপোজিট
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">গ্রাহকের দৈনিক আয়ের সীমা:</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      ৳ {settings.dailyUserEarningCap}
                    </span>
                    <span className="text-[10px] text-amber-300/80 block mt-1">
                      ১০০ টাকার বেশি আয় স্বয়ংক্রিয় লক
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">নতুন ইউজার সাইনআপ বোনাস:</span>
                    <span className="text-2xl font-black text-cyan-400 font-mono">
                      ৳ {settings.newUserBonus}
                    </span>
                    <span className="text-[10px] text-cyan-300/80 block mt-1">
                      নতুন রেজিস্টার্ডদের প্রদেয় ১০০ ৳
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">অ্যাড রেভিনিউ স্প্লিট রেশিও:</span>
                    <span className="text-2xl font-black text-purple-400 font-mono">
                      {settings.userAdSharePercent}% / {settings.adminAdSharePercent}%
                    </span>
                    <span className="text-[10px] text-purple-300/80 block mt-1">
                      ইউজার ৫০% • এডমিন ব্যাংক ৫০%
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Rules Explanation Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>সক্রিয় বাণিজ্যিক নীতিমালা (Business Logic Active Rules):</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <strong className="text-emerald-400 block mb-1">১. ৫০% অ্যাড রেভিনিউ অটো ডিপোজিট:</strong>
                    গ্রাহক প্রতিটি বিজ্ঞাপন দেখার পর অর্জিত টাকার ৫০% গ্রাহক পায় এবং বাকি ৫০% স্বয়ংক্রিয়ভাবে আপনার ডাচ-বাংলা ব্যাংক একাউন্টে জমা হয়ে যায়।
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <strong className="text-amber-400 block mb-1">২. সারাদিনে ১০০ টাকা আয়ের হার্ড লিমিট:</strong>
                    যেকোনো সাধারণ ইউজার সারাদিনে সর্বোচ্চ ১০০ টাকার বেশি আয় করতে পারবে না। ১০০ টাকা হলে সিস্টেম স্বয়ংক্রিয়ভাবে তার ইনকাম লক করে দেয়।
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <strong className="text-cyan-400 block mb-1">৩. নতুন ইউজার ১০০ টাকা বোনাস:</strong>
                    নতুন ইউজার একাউন্ট খুললেই সরাসরি ১০০ টাকা পায় এবং বাদবাকি রেভিনিউ পুল এডমিনের আন্ডারে সুরক্ষিত থাকে।
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <strong className="text-rose-400 block mb-1">৪. রেফারেল ২০ টাকা + এডমিন ১০ টাকা:</strong>
                    কোনো ইউজার রেফার করলে সে পাবে ২০ টাকা এবং এডমিনের একাউন্টে সাথে সাথে ১০ টাকা অটোমেটিক চলে আসবে।
                  </div>
                </div>
              </div>

              {/* Recent Split Income Stream */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                  <span>সাম্প্রতিক এডমিন আয়ের ট্রানজ্যাকশন:</span>
                  <span className="text-xs text-amber-400 font-mono">মোট রেকর্ড: {ledger.length} টি</span>
                </h3>
                <div className="space-y-2">
                  {ledger.slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          ৳
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{item.description}</div>
                          <div className="text-[10px] text-slate-400">
                            উৎস ইউজার: {item.sourceUser} • {new Date(item.timestamp).toLocaleTimeString('bn-BD')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          +৳ {item.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">ব্যাংকে জমা</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN BANK ACCOUNT */}
          {activeTab === 'bank' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Bank Card Graphic */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-slate-950 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex flex-col justify-between h-44">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900/80">
                        এডমিন অফিশিয়াল ব্যাংক একাউন্ট
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-950">{adminBank.bankName}</h3>
                    </div>
                    <Building2 className="w-10 h-10 text-slate-950/70" />
                  </div>

                  <div>
                    <div className="text-xs text-slate-900/80">একাউন্ট নম্বর:</div>
                    <div className="font-mono text-xl sm:text-2xl font-black tracking-widest text-slate-950">
                      {adminBank.accountNumber}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-900/90">
                    <div>হোল্ডার: {adminBank.accountName}</div>
                    <div>রাউটিং: {adminBank.routingNumber}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit details or Withdraw */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Withdraw Form */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>এডমিন ব্যাংক ফান্ড উত্তোলন</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    এডমিন একাউন্টে জমা হওয়া টাকা সরাসরি আপনার ব্যক্তিগত ব্যাংক বা এমএফএস এ ক্যাশআউট করুন।
                  </p>

                  <form onSubmit={handleAdminBankWithdraw} className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        placeholder="টাকার পরিমাণ লিখুন"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white font-mono text-sm outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      ব্যাংক থেকে ট্রান্সফার করুন
                    </button>

                    {withdrawSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-semibold">
                        {withdrawSuccessMsg}
                      </div>
                    )}
                  </form>
                </div>

                {/* Edit Bank Info */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>ব্যাংক একাউন্ট তথ্য পরিবর্তন</span>
                    </h4>
                    {!editingBank && (
                      <button
                        onClick={() => setEditingBank(true)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>এডিট</span>
                      </button>
                    )}
                  </div>

                  {editingBank ? (
                    <form onSubmit={handleSaveBankDetails} className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">ব্যাংকের নাম:</label>
                        <input
                          type="text"
                          value={bankForm.bankName}
                          onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">একাউন্টের নাম:</label>
                        <input
                          type="text"
                          value={bankForm.accountName}
                          onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">একাউন্ট নম্বর:</label>
                        <input
                          type="text"
                          value={bankForm.accountNumber}
                          onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                        >
                          সংরক্ষণ করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBank(false)}
                          className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300"
                        >
                          বাতিল
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2 text-xs text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-500 block">শাখা:</span>
                        <span>{adminBank.branchName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">রাউটিং নম্বর:</span>
                        <span className="font-mono">{adminBank.routingNumber}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                        ✓ সকল ৫০% অ্যাড রেভিনিউ অটোমেটিক এই একাউন্টে জমা হচ্ছে।
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLATFORM LIMITS & SPLIT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1">
                  প্ল্যাটফর্ম আয়ের সীমা ও রেভিনিউ স্প্লিট কনফিগারেশন
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                  এখানে আপনি আপনার চাহিদা অনুযায়ী গ্রাহকদের সারাদিনের আয়ের সীমা ও পার্সেন্টেজ পরিবর্তন করতে পারবেন।
                </p>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  {/* Daily Cap */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      ১. গ্রাহকদের সারাদিনে সর্বোচ্চ আয়ের সীমা (টাকা):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={localSettings.dailyUserEarningCap}
                        onChange={e =>
                          setLocalSettings({
                            ...localSettings,
                            dailyUserEarningCap: parseFloat(e.target.value) || 100,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                      />
                      <span className="text-xs text-slate-400 whitespace-nowrap">ডিফল্ট: ১০০ ৳</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      এর বেশি কোনো গ্রাহক সারাদিনে আয় করতে পারবে না।
                    </span>
                  </div>

                  {/* New User Bonus */}
                  <div>
                    <label className="block text-xs font-semibold text-cyan-300 mb-1">
                      ২. নতুন ইউজার সাইনআপ বোনাস (টাকা):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={localSettings.newUserBonus}
                        onChange={e =>
                          setLocalSettings({
                            ...localSettings,
                            newUserBonus: parseFloat(e.target.value) || 100,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                      />
                      <span className="text-xs text-slate-400 whitespace-nowrap">ডিফল্ট: ১০০ ৳</span>
                    </div>
                  </div>

                  {/* Ad Split 50% */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">
                        ৩. গ্রাহক অ্যাড শেয়ার (%):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={localSettings.userAdSharePercent}
                        onChange={e =>
                          setLocalSettings({
                            ...localSettings,
                            userAdSharePercent: parseFloat(e.target.value) || 50,
                            adminAdSharePercent: 100 - (parseFloat(e.target.value) || 50),
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-purple-300 mb-1">
                        ৪. এডমিন ব্যাংক শেয়ার (%):
                      </label>
                      <input
                        type="number"
                        disabled
                        value={localSettings.adminAdSharePercent}
                        className="w-full px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-purple-300 font-mono font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Referral user bonus vs admin cut */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-amber-300 mb-1">
                        ৫. রেফারকারী পাবে (টাকা):
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={localSettings.referralUserBonus}
                        onChange={e =>
                          setLocalSettings({
                            ...localSettings,
                            referralUserBonus: parseFloat(e.target.value) || 20,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-300 mb-1">
                        ৬. এডমিন পাবে (টাকা):
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={localSettings.referralAdminCut}
                        onChange={e =>
                          setLocalSettings({
                            ...localSettings,
                            referralAdminCut: parseFloat(e.target.value) || 10,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-101 active:scale-98 transition-all cursor-pointer"
                  >
                    সেটিংস সংরক্ষণ করুন (Save Settings)
                  </button>

                  {savedSettingsMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
                      ✓ সেটিংস সফলভাবে আপডেট ও সক্রিয় করা হয়েছে!
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: USERS & DAILY CAP MONITOR */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">গ্রাহকদের আজকের আয়ের মনিটরিং</h3>
                  <p className="text-xs text-slate-400">
                    দৈনিক ১০০ টাকা সীমার মধ্যে কে কত আয় করেছে তা সরাসরি পর্যবেক্ষণ করুন
                  </p>
                </div>
                <div className="text-xs text-amber-300 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  সর্বোচ্চ সীমা: ৳{settings.dailyUserEarningCap}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'তানভীর আহমেদ', phone: '01712***891', earned: 85.5, joined: 'আজকে' },
                  { name: 'মারুফ হোসেন', phone: '01845***224', earned: 100.0, joined: 'গতকাল' },
                  { name: 'সাদিয়া ইসলাম', phone: '01911***567', earned: 62.0, joined: '৩ দিন আগে' },
                  { name: 'রাকিবুল হাসান', phone: '01678***430', earned: 100.0, joined: '৪ দিন আগে' },
                  { name: 'মেহেদী হাসান', phone: '01790***118', earned: 45.0, joined: '৫ দিন আগে' },
                  { name: 'নাঈম রহমান', phone: '01314***902', earned: 100.0, joined: '১ সপ্তাহ আগে' },
                ].map(u => {
                  const isCapped = u.earned >= settings.dailyUserEarningCap;
                  const percent = Math.min(100, (u.earned / settings.dailyUserEarningCap) * 100);

                  return (
                    <div
                      key={u.phone}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-white">{u.name}</div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCapped
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {isCapped ? 'সীমা পূর্ণ (100৳)' : 'চলমান'}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-400">
                        {u.phone} • যোগ দিয়েছেন {u.joined}
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">আজকের আয়:</span>
                          <span className="font-black text-emerald-400 font-mono">
                            ৳ {u.earned.toFixed(2)} / ৳ {settings.dailyUserEarningCap}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              isCapped ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: 50% SPLIT LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">৫০% অ্যাড স্প্লিট ও রেভিনিউ লেজার</h3>
                  <p className="text-xs text-slate-400">
                    প্রতিটি বিজ্ঞাপন এবং রেফারেল থেকে এডমিন একাউন্টে জমা হওয়া রিয়েল-টাইম আয়
                  </p>
                </div>
                <div className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                  মোট জমা: ৳ {adminBank.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="space-y-2">
                {ledger.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {item.type === 'ad_split_50' ? '50%' : 'REF'}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">{item.description}</div>
                        <div className="text-[11px] text-slate-400">
                          ইউজার আইডি: {item.sourceUser} • {new Date(item.timestamp).toLocaleString('bn-BD')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                        +৳ {item.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">অটো ডিপোজিট সম্পন্ন ✓</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
