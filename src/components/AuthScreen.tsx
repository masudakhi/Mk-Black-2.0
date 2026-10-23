import React, { useState } from 'react';
import {
  Smartphone,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Gift,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserProfile } from '../types';
import { sound } from '../services/sound';
import { ADMIN_EMAIL } from '../services/storage';
import confetti from 'canvas-confetti';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile, isNewUser: boolean, referralBonusApplied: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');

  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP flow for phone
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [countdown, setCountdown] = useState(60);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Switch between Login and Register
  const handleModeSwitch = (newMode: 'login' | 'register') => {
    sound.playClick();
    setMode(newMode);
    setErrorMsg('');
    setStep('input');
  };

  // Switch between Phone and Email
  const handleMethodSwitch = (newMethod: 'phone' | 'email') => {
    sound.playClick();
    setMethod(newMethod);
    setErrorMsg('');
    setStep('input');
  };

  // Submit phone -> Generate simulated OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.trim().replace(/[-\s]/g, '');
    if (!cleanPhone.startsWith('01') || cleanPhone.length !== 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)');
      sound.playHit();
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার নাম লিখুন।');
      sound.playHit();
      return;
    }

    setIsLoading(true);
    sound.playClick();

    setTimeout(() => {
      setIsLoading(false);
      // Generate realistic 6 digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setStep('otp');
      setCountdown(60);
      sound.playCoin();
    }, 800);
  };

  // Verify OTP & complete Auth
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpInput.trim() !== generatedOtp && otpInput.trim() !== '123456') {
      setErrorMsg('ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক কোডটি লিখুন।');
      sound.playHit();
      return;
    }

    setIsLoading(true);
    sound.playCash();

    setTimeout(() => {
      setIsLoading(false);
      const isNew = mode === 'register';
      const hasReferral = Boolean(referralCode.trim());

      const user: UserProfile = {
        id: 'usr_' + Date.now(),
        name: name.trim() || `User ${phone.slice(-4)}`,
        identifier: phone,
        authType: 'phone',
        joinedAt: Date.now(),
        avatarSeed: phone,
      };

      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onAuthSuccess(user, isNew, hasReferral);
    }, 600);
  };

  // Email Submit
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('অনুগ্রহ করে সঠিক ইমেইল অ্যাড্রেস লিখুন।');
      sound.playHit();
      return;
    }

    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      sound.playHit();
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার নাম লিখুন।');
      sound.playHit();
      return;
    }

    setIsLoading(true);
    sound.playCash();

    setTimeout(() => {
      setIsLoading(false);
      const isNew = mode === 'register';
      const hasReferral = Boolean(referralCode.trim());
      const isAdmin = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

      const user: UserProfile = {
        id: 'usr_' + Date.now(),
        name: isAdmin ? 'মাস্টার এডমিন (Mafizul Islam)' : name.trim() || email.split('@')[0],
        identifier: email,
        authType: 'email',
        role: isAdmin ? 'admin' : 'user',
        joinedAt: Date.now(),
        avatarSeed: email,
      };

      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onAuthSuccess(user, isNew, hasReferral);
    }, 700);
  };

  // Instant 1-Click Master Admin Login (mafizuli83@gmail.com)
  const handleAdminLogin = () => {
    sound.playCash();
    const adminProfile: UserProfile = {
      id: 'admin_master_01',
      name: 'মাস্টার এডমিন (Mafizul Islam)',
      identifier: ADMIN_EMAIL,
      authType: 'email',
      role: 'admin',
      joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
      avatarSeed: 'admin',
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

    onAuthSuccess(adminProfile, false, false);
  };

  // Instant 1-Click Demo Login for smooth testing
  const handleDemoLogin = () => {
    sound.playCash();
    const demoUser: UserProfile = {
      id: 'demo_user_01',
      name: 'হাসান মাহমুদ',
      identifier: '01712345678',
      authType: 'phone',
      role: 'user',
      joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      avatarSeed: 'hasan',
    };

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onAuthSuccess(demoUser, false, false);
  };

  return (
    <div className="min-h-screen w-full bg-[#070b13] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Brand Lockup Header */}
        <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-700 flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            ৳
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              টাকা ইনকাম প্রো
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              BD
            </span>
          </div>
          <p className="text-xs text-slate-400">
            বিজ্ঞাপন দেখুন, গেম খেলুন ও সরাসরি বিকাশ, নগদ ও রকেটে টাকা নিন
          </p>

          {/* Welcome Bonus Callout */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>নতুন সাইন আপে নিশ্চিত ৳২৫.০০ ফ্রি ওয়েলকাম বোনাস!</span>
          </div>
        </div>

        {/* Mode Selector Tabs (Login vs Register) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            লগইন (Sign In)
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            নতুন একাউন্ট খুলুন (Sign Up)
          </button>
        </div>

        {/* Method Toggle (Phone vs Email) */}
        <div className="px-6 pt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleMethodSwitch('phone')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              method === 'phone'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>মোবাইল নম্বর</span>
          </button>

          <button
            type="button"
            onClick={() => handleMethodSwitch('email')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              method === 'email'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>ইমেইল অ্যাড্রেস</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Case 1: Phone Method -> Input Step */}
          {method === 'phone' && step === 'input' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    আপনার পূর্ণ নাম:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="যেমন: মোঃ সাকিব হোসেন"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white text-sm outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  বাংলাদেশি মোবাইল নম্বর:
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-2xl border border-r-0 border-slate-700 bg-slate-950 text-slate-300 text-xs font-mono font-bold">
                    🇧🇩 +880
                  </span>
                  <input
                    type="tel"
                    placeholder="01712345678"
                    maxLength={11}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-r-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white font-mono text-sm outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  বিকাশ, নগদ বা রকেট অ্যাকাউন্ট নম্বর দিলে দ্রুত ক্যাশআউট পাবেন।
                </span>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>রেফারেল কোড (ঐচ্ছিক):</span>
                    <button
                      type="button"
                      onClick={() => setReferralCode('BD89201')}
                      className="text-[11px] text-amber-400 hover:text-amber-300"
                    >
                      কোড দিন (+১০ ৳)
                    </button>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: BD89201"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-amber-300 font-mono text-sm outline-none uppercase"
                  />
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>ওটিপি কোড পাঠান (Get OTP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Case 1: Phone Method -> OTP Step */}
          {method === 'phone' && step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                <div className="text-xs text-slate-300">
                  <strong className="text-emerald-400 font-mono">{phone}</strong> নম্বরে ৬ ডিজিটের ভেরিফিকেশন ওটিপি পাঠানো হয়েছে।
                </div>
                {/* Instant auto-fill button for realistic convenience */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-[11px] text-amber-300 font-mono">
                    এসএমএস ওটিপি: <strong className="text-white text-xs">{generatedOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setOtpInput(generatedOtp);
                    }}
                    className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-[10px] hover:bg-amber-300"
                  >
                    স্বয়ংক্রিয় বসান
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                  ৬ ডিজিটের ওটিপি কোড লিখুন:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="______"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-center text-white font-mono text-xl tracking-widest outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  নম্বর পরিবর্তন
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ভেরিফাই ও প্রবেশ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Case 2: Email Method */}
          {method === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    আপনার পূর্ণ নাম:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="যেমন: তানভীর হাসান"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white text-sm outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ইমেইল ঠিকানা:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  পাসওয়ার্ড:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>রেফারেল কোড (ঐচ্ছিক):</span>
                    <button
                      type="button"
                      onClick={() => setReferralCode('BD89201')}
                      className="text-[11px] text-amber-400 hover:text-amber-300"
                    >
                      কোড দিন (+১০ ৳)
                    </button>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: BD89201"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-amber-300 font-mono text-sm outline-none uppercase"
                  />
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'লগইন করুন' : 'নিবন্ধন সম্পন্ন করুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo & Admin Login Options */}
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleAdminLogin}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>👑 এডমিন (mafizuli83@gmail.com) হিসেবে প্রবেশ করুন</span>
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>সাধারণ গ্রাহক ডেমো অ্যাকাউন্ট (User Demo)</span>
            </button>
          </div>
        </div>

        {/* Security badge at bottom */}
        <div className="py-2.5 px-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>১০০% এনক্রিপ্টেড ও সম্পূর্ণ নিরাপদ বাংলাদেশি সার্ভার</span>
        </div>
      </div>
    </div>
  );
};
