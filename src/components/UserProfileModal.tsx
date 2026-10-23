import React from 'react';
import { X, LogOut, ShieldCheck, User, Phone, Mail, Calendar, Wallet, Trophy, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserWallet } from '../types';
import { sound } from '../services/sound';

interface UserProfileModalProps {
  user: UserProfile;
  wallet: UserWallet;
  onClose: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  wallet,
  onClose,
  onLogout,
}) => {
  const joinDate = new Date(user.joinedAt).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header with background pattern */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-slate-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-1 mx-auto mb-3 shadow-xl">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-3xl font-black text-emerald-400">
              {user.name.charAt(0) || '👤'}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h3 className="text-xl font-black text-white">{user.name}</h3>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs font-mono text-slate-300 bg-slate-950/70 px-2.5 py-0.5 rounded-full border border-slate-800">
              {user.identifier}
            </span>
            {user.role === 'admin' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                👑 মাস্টার এডমিন (Super Admin)
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ভেরিফাইড প্রো আর্নার
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">বর্তমান ব্যালেন্স:</span>
              <span className="text-lg font-black text-emerald-400 tabular-nums">
                ৳ {wallet.taka.toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">মোট উত্তোলন সম্পন্ন:</span>
              <span className="text-lg font-black text-purple-400 tabular-nums">
                ৳ {wallet.totalWithdrawn.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>যোগদানের তারিখ:</span>
              </span>
              <span className="text-slate-200">{joinDate}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>লগইন মেথড:</span>
              </span>
              <span className="text-slate-200 capitalize">
                {user.authType === 'phone' ? 'মোবাইল ওটিপি (Phone)' : 'ইমেইল (Email)'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-slate-500" />
                <span>রেফারেল কোড:</span>
              </span>
              <span className="font-mono font-bold text-amber-300">{wallet.referralCode}</span>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={() => {
              sound.playClick();
              if (confirm('আপনি কি নিশ্চিত যে আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?')) {
                onLogout();
              }
            }}
            className="w-full py-3 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন (Log Out)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
