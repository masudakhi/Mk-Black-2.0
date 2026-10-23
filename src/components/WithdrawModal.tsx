import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Wallet, Sparkles, Smartphone } from 'lucide-react';
import { PaymentMethod, Transaction } from '../types';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface WithdrawModalProps {
  currentTaka: number;
  onClose: () => void;
  onConfirmWithdraw: (tx: Transaction) => void;
}

const METHODS: Array<{
  id: PaymentMethod;
  name: string;
  nameBn: string;
  minAmount: number;
  color: string;
  textColor: string;
  bgGrad: string;
  iconText: string;
}> = [
  {
    id: 'bkash',
    name: 'bKash',
    nameBn: 'বিকাশ',
    minAmount: 50,
    color: '#E2136E',
    textColor: 'text-[#E2136E]',
    bgGrad: 'from-pink-600 to-rose-700',
    iconText: 'bKash',
  },
  {
    id: 'nagad',
    name: 'Nagad',
    nameBn: 'নগদ',
    minAmount: 50,
    color: '#F7941D',
    textColor: 'text-[#F7941D]',
    bgGrad: 'from-orange-500 to-amber-600',
    iconText: 'নগদ',
  },
  {
    id: 'rocket',
    name: 'Rocket',
    nameBn: 'রকেট',
    minAmount: 50,
    color: '#8C3494',
    textColor: 'text-[#8C3494]',
    bgGrad: 'from-purple-600 to-fuchsia-700',
    iconText: 'রকেট',
  },
  {
    id: 'recharge',
    name: 'Recharge',
    nameBn: 'মোবাইল রিচার্জ',
    minAmount: 20,
    color: '#059669',
    textColor: 'text-emerald-400',
    bgGrad: 'from-emerald-600 to-teal-700',
    iconText: 'Recharge',
  },
];

const PRESETS = [50, 100, 200, 500];
const OPERATORS = ['Grameenphone', 'Banglalink', 'Robi', 'Airtel', 'Teletalk'];

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  currentTaka,
  onClose,
  onConfirmWithdraw,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState<string>('50');
  const [accountType, setAccountType] = useState<'personal' | 'agent'>('personal');
  const [operator, setOperator] = useState('Grameenphone');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeMethodConfig = METHODS.find(m => m.id === selectedMethod) || METHODS[0];

  const handleMethodSelect = (method: PaymentMethod) => {
    sound.playClick();
    setSelectedMethod(method);
    setErrorMsg('');
    const cfg = METHODS.find(m => m.id === method);
    if (cfg && parseFloat(amount || '0') < cfg.minAmount) {
      setAmount(cfg.minAmount.toString());
    }
  };

  const handleAmountPreset = (val: number) => {
    sound.playClick();
    setAmount(val.toString());
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন।');
      sound.playHit();
      return;
    }

    if (parsedAmount > currentTaka) {
      setErrorMsg(`আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! বর্তমান ব্যালেন্স: ৳${currentTaka.toFixed(2)}`);
      sound.playHit();
      return;
    }

    if (parsedAmount < activeMethodConfig.minAmount) {
      setErrorMsg(`${activeMethodConfig.nameBn} এ সর্বনিম্ন উইথড্র পরিমাণ ৳${activeMethodConfig.minAmount} টাকা।`);
      sound.playHit();
      return;
    }

    // Number validation
    const cleanNum = accountNumber.trim().replace(/[-\s]/g, '');
    if (selectedMethod === 'rocket') {
      if (cleanNum.length !== 12 || !cleanNum.startsWith('01')) {
        setErrorMsg('সঠিক ১২ ডিজিটের রকেট একাউন্ট নম্বর লিখুন (যেমন: 017XXXXXXXXX)');
        sound.playHit();
        return;
      }
    } else {
      if (cleanNum.length !== 11 || !cleanNum.startsWith('01')) {
        setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)');
        sound.playHit();
        return;
      }
    }

    setIsSubmitting(true);
    sound.playClick();

    // Generate genuine TrxID
    const prefix = selectedMethod === 'bkash' ? 'BK' : selectedMethod === 'nagad' ? 'NG' : selectedMethod === 'rocket' ? 'RC' : 'RCG';
    const randomChars = Math.random().toString(36).substring(2, 9).toUpperCase();
    const trxId = `${prefix}${randomChars}`;

    setTimeout(() => {
      setIsSubmitting(false);
      sound.playCash();

      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        trxId,
        method: selectedMethod,
        accountNumber: cleanNum,
        amount: parsedAmount,
        fee: 0, // Free promo
        netAmount: parsedAmount,
        status: 'completed',
        timestamp: Date.now(),
        operator: selectedMethod === 'recharge' ? operator : undefined,
      };

      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onConfirmWithdraw(newTx);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl my-auto">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">সরাসরি টাকা উত্তোলন (Cashout)</h3>
              <p className="text-xs text-slate-400">বিকাশ, নগদ, রকেট ও মোবাইল রিচার্জ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Available Balance Bar */}
        <div className="bg-slate-950/50 px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">উত্তোলনযোগ্য মেইন ব্যালেন্স:</span>
          <span className="text-base font-black text-emerald-400 tabular-nums">
            ৳ {currentTaka.toFixed(2)} টাকা
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Payment Method Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              পেমেন্ট মাধ্যম নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {METHODS.map(m => {
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handleMethodSelect(m.id)}
                    className={`relative p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-transparent shadow-lg ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 bg-slate-800'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-md"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.iconText}
                    </div>
                    <span className="text-xs font-bold text-white">{m.nameBn}</span>
                    <span className="text-[10px] text-slate-400">মিনিমাম ৳{m.minAmount}</span>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Type or Operator Details */}
          {selectedMethod === 'recharge' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                মোবাইল অপারেটর নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {OPERATORS.map(op => (
                  <button
                    type="button"
                    key={op}
                    onClick={() => {
                      sound.playClick();
                      setOperator(op);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      operator === op
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">অ্যাকাউন্টের ধরন:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('personal')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    accountType === 'personal'
                      ? 'bg-pink-600/30 text-pink-300 border-pink-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  ব্যক্তিগত (Personal)
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('agent')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    accountType === 'agent'
                      ? 'bg-pink-600/30 text-pink-300 border-pink-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  এজেন্ট (Agent)
                </button>
              </div>
            </div>
          )}

          {/* Account Number Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {activeMethodConfig.nameBn} নম্বর দিন:
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder={selectedMethod === 'rocket' ? 'যেমন: 017XXXXXXXXX (১২ সংখ্যা)' : 'যেমন: 017XXXXXXXX (১১ সংখ্যা)'}
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                maxLength={selectedMethod === 'rocket' ? 12 : 11}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white font-mono text-base placeholder-slate-500 outline-none transition-all"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono">
                {accountNumber.length}/{selectedMethod === 'rocket' ? 12 : 11}
              </span>
            </div>
          </div>

          {/* Amount Input & Preset Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">টাকার পরিমাণ (BDT):</label>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAmount(Math.floor(currentTaka).toString());
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
              >
                সব টাকা উইথড্র করুন
              </button>
            </div>

            <div className="relative mb-2">
              <span className="absolute left-4 top-3 text-lg font-black text-slate-400">৳</span>
              <input
                type="number"
                min={activeMethodConfig.minAmount}
                step="1"
                placeholder="৫০"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white font-black text-xl tabular-nums outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              {PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleAmountPreset(preset)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    amount === preset.toString()
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  ৳{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Fee & Processing Info */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>উত্তোলন ফি (Withdrawal Fee):</span>
              <span className="text-emerald-400 font-bold">৳ 0.00 (ফ্রি প্রোমোশন)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>প্রসেসিং সময়:</span>
              <span className="text-slate-300">স্বয়ংক্রিয় দ্রুত ট্রান্সফার (৫-১৫ মিনিট)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>১০০% নিরাপদ ও সরাসরি বাংলাদেশি এমএফএস ট্রান্সফার সিস্টেম</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Cashout Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
              isSubmitting
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 via-rose-600 to-orange-500 text-white shadow-rose-900/40 hover:brightness-110 active:scale-98'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>লেনদেন প্রসেস হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>নিশ্চিত উইথড্র করুন (Withdraw ৳{amount || '0'})</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
