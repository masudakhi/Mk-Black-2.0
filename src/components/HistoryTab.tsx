import React from 'react';
import { Transaction, PaymentMethod } from '../types';
import { CheckCircle2, Clock, AlertCircle, ArrowUpRight, Receipt, Wallet } from 'lucide-react';
import { sound } from '../services/sound';

interface HistoryTabProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenWithdraw: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  transactions,
  onSelectTransaction,
  onOpenWithdraw,
}) => {
  const getMethodBadge = (m: PaymentMethod, op?: string) => {
    switch (m) {
      case 'bkash':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E2136E] text-white">বিকাশ</span>;
      case 'nagad':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F7941D] text-white">নগদ</span>;
      case 'rocket':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#8C3494] text-white">রকেট</span>;
      case 'recharge':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
            {op || 'রিচার্জ'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">লেনদেন ইতিহাস (Withdrawal History)</h2>
          <p className="text-xs text-slate-400">আপনার বিকাশ, নগদ, রকেট ও রিচার্জের সকল পেমেন্ট রেকর্ড</p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onOpenWithdraw();
          }}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-900/30 hover:scale-102 transition-all cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>নতুন উইথড্র করুন</span>
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">এখনো কোনো উত্তোলন করা হয়নি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            ভিডিও দেখুন অথবা গেম খেলে ৫০ টাকা হলে সরাসরি বিকাশ বা নগদে তুলে নিন!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactions.map(tx => {
            const dateStr = new Date(tx.timestamp).toLocaleString('bn-BD', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={tx.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTransaction(tx);
                }}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 cursor-pointer transition-all hover:bg-slate-850 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getMethodBadge(tx.method, tx.operator)}
                      <span className="font-mono text-xs sm:text-sm font-bold text-white">
                        {tx.accountNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>TrxID: {tx.trxId}</span>
                      <span>•</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-black text-emerald-400 tabular-nums">
                    -৳ {tx.amount.toFixed(2)}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-400 font-semibold mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>সফল (পেইড)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
