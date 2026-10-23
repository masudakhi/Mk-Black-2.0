import React, { useEffect, useState } from 'react';
import { INITIAL_LIVE_PAYOUTS } from '../services/storage';
import { LivePayout, PaymentMethod } from '../types';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Gazipur', 'Barisal', 'Cumilla', 'Bogra', 'Mymensingh'];
const AMOUNTS = [30, 50, 100, 150, 200, 300, 500];
const METHODS: PaymentMethod[] = ['bkash', 'nagad', 'rocket', 'recharge'];

export const PaymentTicker: React.FC = () => {
  const [payouts, setPayouts] = useState<LivePayout[]>(INITIAL_LIVE_PAYOUTS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Periodically generate a realistic new live payout
  useEffect(() => {
    const interval = setInterval(() => {
      const randomPrefix = ['017', '018', '019', '016', '013', '015'][Math.floor(Math.random() * 6)];
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const randomMethod = METHODS[Math.floor(Math.random() * METHODS.length)];
      const randomAmount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];

      const newPayout: LivePayout = {
        id: 'lp_' + Date.now(),
        userPhone: `${randomPrefix}****${randomSuffix}`,
        method: randomMethod,
        amount: randomAmount,
        city: randomCity,
        timeAgo: 'এইমাত্র',
      };

      setPayouts(prev => [newPayout, ...prev.slice(0, 15)]);
      setCurrentIndex(0);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const current = payouts[currentIndex] || payouts[0];

  const getMethodBadge = (m: PaymentMethod) => {
    switch (m) {
      case 'bkash':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E2136E] text-white">বিকাশ</span>;
      case 'nagad':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F7941D] text-white">নগদ</span>;
      case 'rocket':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8C3494] text-white">রকেট</span>;
      case 'recharge':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">রিচার্জ</span>;
    }
  };

  return (
    <div className="bg-slate-900/60 border-y border-slate-800/80 py-1.5 px-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">লাইভ পেমেন্ট প্রুফ:</span>
            <span className="sm:hidden">পেমেন্ট:</span>
          </div>

          {current && (
            <div className="flex items-center gap-1.5 truncate text-slate-300 animate-fade-in">
              <span className="font-mono text-slate-200 font-medium">{current.userPhone}</span>
              <span>({current.city})</span>
              <span>পেলেন</span>
              <span className="font-bold text-emerald-400">৳{current.amount}</span>
              {getMethodBadge(current.method)}
              <span className="text-slate-400 text-[11px] ml-1">({current.timeAgo})</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <span>মোট ক্যাশআউট প্রদান: <strong className="text-emerald-400 font-mono">৳ ৩,৪৫,৮২০+</strong></span>
        </div>
      </div>
    </div>
  );
};
