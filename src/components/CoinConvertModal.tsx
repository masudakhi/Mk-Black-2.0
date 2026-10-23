import React, { useState } from 'react';
import { X, Coins, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface CoinConvertModalProps {
  currentCoins: number;
  onClose: () => void;
  onConvert: (coinsToConvert: number, takaEarned: number) => void;
}

export const CoinConvertModal: React.FC<CoinConvertModalProps> = ({
  currentCoins,
  onClose,
  onConvert,
}) => {
  const [coinsAmount, setCoinsAmount] = useState<string>(
    currentCoins >= 100 ? (Math.floor(currentCoins / 100) * 100).toString() : '0'
  );
  const [errorMsg, setErrorMsg] = useState('');

  const numCoins = parseInt(coinsAmount || '0', 10);
  const takaCalculated = (numCoins / 100).toFixed(2);

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numCoins) || numCoins < 100) {
      setErrorMsg('সর্বনিম্ন ১০০ কয়েন রূপান্তর করতে পারবেন (১০০ কয়েন = ১ টাকা)।');
      sound.playHit();
      return;
    }
    if (numCoins > currentCoins) {
      setErrorMsg(`আপনার অ্যাকাউন্টে পর্যাপ্ত কয়েন নেই! বর্তমান কয়েন: ${currentCoins}`);
      sound.playHit();
      return;
    }

    const takaEarned = numCoins / 100;
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
    onConvert(numCoins, takaEarned);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">কয়েন টু টাকা কনভার্টার</h3>
              <p className="text-xs text-slate-400">১০০ কয়েন = ১.০০ টাকা সরাসরি ওয়ালেটে</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConvertSubmit} className="p-5 space-y-4">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">আপনার বর্তমান কয়েন:</span>
            <span className="text-base font-black text-amber-400 tabular-nums">
              {currentCoins.toLocaleString()} Coins
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                কত কয়েন কনভার্ট করতে চান?
              </label>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCoinsAmount((Math.floor(currentCoins / 100) * 100).toString());
                  setErrorMsg('');
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold"
              >
                সর্বোচ্চ কয়েন দিন
              </button>
            </div>

            <input
              type="number"
              step="100"
              min="100"
              value={coinsAmount}
              onChange={e => {
                setCoinsAmount(e.target.value);
                setErrorMsg('');
              }}
              placeholder="১০০"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white font-mono text-lg outline-none"
            />
          </div>

          {/* Conversion Result Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="font-mono font-bold text-slate-200">{numCoins || 0} কয়েন</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">পাবেন:</span>
              <span className="text-lg font-black text-emerald-400 tabular-nums">৳ {takaCalculated} টাকা</span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-black text-base bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>কনভার্ট করে টাকা নিন</span>
          </button>
        </form>
      </div>
    </div>
  );
};
