import React from 'react';
import { Trophy, Medal, Flame, Star, ShieldCheck } from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  name: string;
  phone: string;
  earned: number;
  city: string;
  badge: string;
}

const TOP_EARNERS: LeaderboardUser[] = [
  { rank: 1, name: 'তানভীর আহমেদ', phone: '01712***891', earned: 3850, city: 'Dhaka', badge: '🥇 চ্যাম্পিয়ন' },
  { rank: 2, name: 'মারুফ হোসেন', phone: '01845***224', earned: 3120, city: 'Chittagong', badge: '🥈 রৌপ্য' },
  { rank: 3, name: 'সাদিয়া ইসলাম', phone: '01911***567', earned: 2790, city: 'Sylhet', badge: '🥉 ব্রোঞ্জ' },
  { rank: 4, name: 'রাকিবুল হাসান', phone: '01678***430', earned: 2450, city: 'Rajshahi', badge: '🔥 এলিট' },
  { rank: 5, name: 'মেহেদী হাসান', phone: '01790***118', earned: 2180, city: 'Khulna', badge: '⭐ প্রো' },
  { rank: 6, name: 'নাঈম রহমান', phone: '01314***902', earned: 1940, city: 'Bogra', badge: '⭐ প্রো' },
  { rank: 7, name: 'ফাতেমা বেগম', phone: '01823***651', earned: 1720, city: 'Cumilla', badge: '⭐ প্রো' },
  { rank: 8, name: 'আরিফুল ইসলাম', phone: '01533***782', earned: 1560, city: 'Barisal', badge: '⭐ প্রো' },
];

export const LeaderboardTab: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/30 text-center relative overflow-hidden shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">আজকের টপ আর্নার লিডারবোর্ড</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
          প্রতিদিন সবচেয়ে বেশি ভিডিও অ্যাড দেখা ও গেম খেলা সেরা ৩ জন পাচ্ছেন বিশেষ নগদ ক্যাশব্যাক উপহার!
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TOP_EARNERS.slice(0, 3).map((u, i) => {
          const borderStyle =
            i === 0
              ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/40'
              : i === 1
              ? 'border-slate-400 bg-slate-800/40'
              : 'border-orange-500/60 bg-orange-950/30';
          return (
            <div
              key={u.phone}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between ${borderStyle} transition-all hover:scale-102`}
            >
              <div className="text-2xl mb-1">{i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'}</div>
              <div className="font-bold text-white text-sm">{u.name}</div>
              <div className="text-xs font-mono text-slate-400">{u.phone}</div>
              <div className="text-[11px] text-slate-400">{u.city}</div>
              <div className="mt-3 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700/80 w-full">
                <span className="text-[10px] text-slate-400 block">মোট আয়:</span>
                <span className="text-base font-black text-emerald-400 tabular-nums">
                  ৳ {u.earned}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ranks 4 to 8 List */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
          র‌্যাংক ৪ থেকে ৮ (আজকের সেরা পারফর্মার)
        </h3>
        <div className="space-y-2">
          {TOP_EARNERS.slice(3).map(u => (
            <div
              key={u.phone}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                  #{u.rank}
                </span>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                    <span>{u.name}</span>
                    <span className="text-[10px] text-amber-400 font-normal">{u.badge}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {u.phone} • {u.city}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs sm:text-sm font-black text-emerald-400 tabular-nums">
                  ৳ {u.earned}
                </div>
                <div className="text-[10px] text-slate-500">বিকাশ/নগদ পেইড</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
