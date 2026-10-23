import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Check, MessageSquare, Download, Share2 } from 'lucide-react';
import { Transaction } from '../types';
import { sound } from '../services/sound';

interface TransactionSlipModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const TransactionSlipModal: React.FC<TransactionSlipModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const copyTrxId = () => {
    sound.playClick();
    navigator.clipboard.writeText(transaction.trxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMethodTheme = () => {
    switch (transaction.method) {
      case 'bkash':
        return {
          name: 'বিকাশ (bKash)',
          color: '#E2136E',
          accentBg: 'bg-[#E2136E]',
          lightBg: 'bg-[#E2136E]/15 border-[#E2136E]/30',
          smsSender: 'bKash',
        };
      case 'nagad':
        return {
          name: 'নগদ (Nagad)',
          color: '#F7941D',
          accentBg: 'bg-[#F7941D]',
          lightBg: 'bg-[#F7941D]/15 border-[#F7941D]/30',
          smsSender: 'Nagad',
        };
      case 'rocket':
        return {
          name: 'রকেট (DBBL Rocket)',
          color: '#8C3494',
          accentBg: 'bg-[#8C3494]',
          lightBg: 'bg-[#8C3494]/15 border-[#8C3494]/30',
          smsSender: '16216',
        };
      case 'recharge':
        return {
          name: `মোবাইল রিচার্জ (${transaction.operator || 'GP'})`,
          color: '#059669',
          accentBg: 'bg-emerald-600',
          lightBg: 'bg-emerald-600/15 border-emerald-500/30',
          smsSender: transaction.operator || 'Recharge',
        };
    }
  };

  const theme = getMethodTheme();
  const dateStr = new Date(transaction.timestamp).toLocaleString('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Header Banner */}
        <div
          className="p-5 text-center text-white relative overflow-hidden"
          style={{ backgroundColor: theme.color }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-black/20 text-white hover:bg-black/40"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 text-white">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black">টাকা উত্তোলন সফল!</h3>
          <p className="text-xs text-white/90">লেনদেনটি সফলভাবে প্রসেস করা হয়েছে</p>
        </div>

        {/* Amount Box */}
        <div className="p-5 text-center border-b border-slate-800 bg-slate-950/40">
          <div className="text-xs text-slate-400">ট্রান্সফারকৃত মোট টাকা:</div>
          <div className="text-3xl font-black text-emerald-400 mt-1 tabular-nums">
            ৳ {transaction.amount.toFixed(2)}
          </div>
          <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            স্ট্যাটাস: সফল (Completed)
          </span>
        </div>

        {/* Detailed Breakdown */}
        <div className="p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">পেমেন্ট মেথড:</span>
            <span className="font-bold text-white">{theme.name}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">গ্রাহকের নম্বর:</span>
            <span className="font-mono font-bold text-white">{transaction.accountNumber}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">লেনদেন আইডি (TrxID):</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-amber-300">{transaction.trxId}</span>
              <button
                onClick={copyTrxId}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="কপি করুন"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">তারিখ ও সময়:</span>
            <span className="text-slate-300">{dateStr}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">সার্ভিস ফি:</span>
            <span className="font-bold text-emerald-400">৳ 0.00 (ফ্রি)</span>
          </div>

          {/* Realistic SMS Message Box */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1.5 text-[11px] font-bold">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>কনফার্মেশন এসএমএস প্রিভিউ:</span>
            </div>
            <p className="font-mono text-[11px] text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 select-all">
              {`You have received Tk ${transaction.amount.toFixed(2)} from Taka Income Pro. Fee Tk 0.00. TrxID ${transaction.trxId}.`}
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              alert(`রিসিট ডাউনলোড সম্পন্ন হয়েছে! TrxID: ${transaction.trxId}`);
            }}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>রিসিট সেভ</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <span>ঠিক আছে</span>
          </button>
        </div>
      </div>
    </div>
  );
};
