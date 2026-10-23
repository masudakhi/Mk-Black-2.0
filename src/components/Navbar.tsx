import React from 'react';
import { Volume2, VolumeX, Sparkles, Flame, Coins, Wallet, User as UserIcon } from 'lucide-react';
import { sound } from '../services/sound';
import { isAdminUser } from '../services/storage';
import { Language, UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  taka: number;
  coins: number;
  streakDays: number;
  language: Language;
  onLanguageToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onOpenWithdraw: () => void;
  onConvertCoins: () => void;
  onCheckinClick: () => void;
  canCheckin: boolean;
  onOpenProfile: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  taka,
  coins,
  streakDays,
  language,
  onLanguageToggle,
  soundEnabled,
  onSoundToggle,
  onOpenWithdraw,
  onConvertCoins,
  onCheckinClick,
  canCheckin,
  onOpenProfile,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-xl">
            ৳
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                {language === 'bn' ? 'টাকা ইনকাম প্রো' : 'Taka Income Pro'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                BD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {language === 'bn' ? 'বিজ্ঞাপন দেখুন, গেম খেলুন ও বিকাশ/নগদে টাকা নিন' : 'Watch Ads, Play & Cashout to bKash/Nagad'}
            </p>
          </div>
        </div>

        {/* Right Info Clusters */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak */}
          <button
            onClick={onCheckinClick}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              canCheckin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse hover:bg-amber-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
            title="দৈনিক চেক-ইন বোনাস"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{streakDays} {language === 'bn' ? 'দিন স্ট্রিক' : 'Days'}</span>
            {canCheckin && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
          </button>

          {/* Coins Readout & Convert */}
          <div
            onClick={onConvertCoins}
            title={language === 'bn' ? 'কয়েন রূপান্তর করুন (১০০ কয়েন = ১ টাকা)' : 'Convert Coins (100 coins = 1 ৳)'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-amber-500/30 hover:border-amber-400/60 cursor-pointer transition-all hover:scale-102 active:scale-98 shadow-sm group"
          >
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="text-right">
              <div className="text-[10px] text-amber-400/80 font-medium leading-none flex items-center justify-end gap-1">
                <span>{language === 'bn' ? 'কয়েন' : 'Coins'}</span>
                <span className="text-[9px] text-slate-400 group-hover:text-amber-300">↻</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-amber-300 tabular-nums leading-tight">
                {coins.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Main Taka Wallet Balance */}
          <div
            onClick={onOpenWithdraw}
            title={language === 'bn' ? 'টাকা ক্যাশআউট করুন' : 'Withdraw Taka'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all hover:scale-102 active:scale-98 shadow-md shadow-emerald-950/40"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
              ৳
            </div>
            <div>
              <div className="text-[10px] text-emerald-300/80 font-medium leading-none">
                {language === 'bn' ? 'মেইন ব্যালেন্স' : 'Balance'}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-300 tabular-nums leading-tight">
                ৳ {taka.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Withdraw CTA Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenWithdraw();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/40 hover:brightness-110 active:scale-95 transition-all"
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'উইথড্র' : 'Withdraw'}</span>
          </button>

          {/* Controls: Sound & Language */}
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-800">
            <button
              onClick={onSoundToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onLanguageToggle}
              className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
              title="Change Language"
            >
              {language === 'bn' ? 'EN' : 'বাং'}
            </button>

            {/* Super Admin Exclusive Button - Only visible to mafizuli83@gmail.com */}
            {user && isAdminUser(user) && onOpenAdmin && (
              <button
                onClick={() => {
                  sound.playCash();
                  onOpenAdmin();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
                title="মাস্টার এডমিন কন্ট্রোল প্যানেল (লুকানো মোড)"
              >
                <span>👑 এডমিন প্যানেল</span>
              </button>
            )}

            {/* User Profile Avatar Button */}
            {user && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenProfile();
                }}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer group"
                title="প্রোফাইল ও লগআউট"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-xs">
                  {user.name.charAt(0) || '👤'}
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white hidden lg:inline max-w-[90px] truncate">
                  {user.name}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
