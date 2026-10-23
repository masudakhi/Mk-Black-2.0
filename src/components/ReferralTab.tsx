import React, { useState } from 'react';
import { Copy, Check, Share2, Users, Gift, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface ReferralTabProps {
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  onSimulateReferral: () => void;
}

export const ReferralTab: React.FC<ReferralTabProps> = ({
  referralCode,
  referralCount,
  referralEarnings,
  onSimulateReferral,
}) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    sound.playClick();
    if (navigator.share) {
      navigator
        .share({
          title: 'টাকা ইনকাম প্রো - প্রতিদিন ৫০০+ টাকা আয়',
          text: `ভিডিও দেখে ও গেম খেলে সরাসরি বিকাশ ও নগদে টাকা নিন! আমার রেফার কোড ব্যবহার করুন: ${referralCode}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      copyCode();
    }
  };

  const testReferralBonus = () => {
    sound.playCash();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    onSimulateReferral();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              রেফারেল রিওয়ার্ড প্রোগ্রাম
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              বন্ধুদের ইনভাইট করুন, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                প্রতি রেফারে ২০ টাকা
              </span>{' '}
              নিন!
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-md">
              আপনার রেফার কোড দিয়ে বন্ধু একাউন্ট খুললেই পাবেন নিশ্চিত ২০ টাকা এবং বন্ধুর আয়ের ওপর আজীবন অতিরিক্ত লাইফটাইম কমিশন!
            </p>
          </div>

          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-xl shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-3xl flex items-center justify-center text-5xl">
              🎁
            </div>
          </div>
        </div>
      </div>

      {/* Code Sharing Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-slate-300 mb-3 text-center sm:text-left">
          আপনার ইউনিক রেফারেল কোড:
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-700">
            <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-widest">
              {referralCode}
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>শেয়ার করুন</span>
          </button>
        </div>

        {/* Demo Button to test referral earning live */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            টেস্ট করার জন্য একটি সফল রেফারেল সিমুলেট করুন:
          </span>
          <button
            onClick={testReferralBonus}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>+২০ ৳ রেফারেল বোনাস টেস্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">মোট রেফারেল সংখ্যা</div>
            <div className="text-2xl font-black text-white tabular-nums">{referralCount} জন</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">রেফারেল থেকে মোট আয়</div>
            <div className="text-2xl font-black text-emerald-400 tabular-nums">
              ৳ {referralEarnings.toFixed(2)} টাকা
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
