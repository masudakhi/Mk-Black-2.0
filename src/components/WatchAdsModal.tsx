import React, { useState, useEffect } from 'react';
import { X, Play, Volume2, VolumeX, CheckCircle, Gift, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { AdCampaign } from '../types';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface WatchAdsModalProps {
  ad: AdCampaign;
  onClose: () => void;
  onRewardClaim: (taka: number, coins: number) => void;
}

export const WatchAdsModal: React.FC<WatchAdsModalProps> = ({ ad, onClose, onRewardClaim }) => {
  const [timeLeft, setTimeLeft] = useState(ad.duration);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Countdown timer for realistic ad watching
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isCompleted) {
        setIsCompleted(true);
        sound.playFanfare();
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      // Play subtle tick on last 3 seconds
      if (timeLeft <= 4) {
        sound.playTick();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isCompleted]);

  const handleClaim = () => {
    if (claimed) return;
    setClaimed(true);
    sound.playCash();
    onRewardClaim(ad.rewardTaka, ad.rewardCoins);
  };

  const progressPercent = Math.min(100, Math.round(((ad.duration - timeLeft) / ad.duration) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Ad Video Header Bar */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]">
              স্পন্সরড ভিডিও বিজ্ঞাপন
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[160px] sm:max-w-xs">{ad.sponsor}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-slate-200"
              title="সাউন্ড"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Close / Skip button */}
            {isCompleted ? (
              <button
                onClick={onClose}
                className="flex items-center gap-1 text-slate-300 hover:text-white font-bold bg-slate-800 px-2.5 py-1 rounded-lg"
              >
                <span>বন্ধ করুন</span>
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                স্কিপ হবে: {timeLeft}s
              </span>
            )}
          </div>
        </div>

        {/* Video Simulation Screen */}
        <div className="relative aspect-video w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          {/* Animated background ambient glow */}
          <div
            className="absolute inset-0 opacity-20 filter blur-3xl"
            style={{ background: `radial-gradient(circle, ${ad.accent} 0%, transparent 70%)` }}
          ></div>

          {/* Simulated Video Content */}
          <div className="relative z-10 flex flex-col items-center max-w-md">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-4xl shadow-xl mb-3 animate-pulse">
              {ad.videoThumbnail}
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white mb-2 shadow" style={{ backgroundColor: ad.accent }}>
              {ad.badge}
            </span>

            <h3 className="text-lg sm:text-xl font-black text-white mb-1.5 leading-snug">
              {ad.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mb-3">
              {ad.tagline}
            </p>

            {/* Interactive Sponsor Link */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                sound.playClick();
                alert(`"${ad.sponsor}" এর স্পেশাল অফার পেজ লোড হচ্ছে... (সফল ভিজিট)`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all hover:scale-102"
            >
              <span>{ad.callToAction}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Live Progress Bar at bottom of screen */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Ad Footer & Reward Claim Action */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>বিজ্ঞাপন দেখার রিওয়ার্ড:</span>
                  <span className="text-[10px] font-bold px-1.5 rounded bg-emerald-500/20 text-emerald-400">
                    ৫০% ইউজার শেয়ার
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-400 tabular-nums">
                    +৳{(ad.rewardTaka * 0.5).toFixed(2)} টাকা
                  </span>
                  <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                    +{ad.rewardCoins} কয়েন
                  </span>
                </div>
              </div>
            </div>

            {/* Claim / Wait Button */}
            <div className="w-full sm:w-auto">
              {isCompleted ? (
                <button
                  onClick={handleClaim}
                  disabled={claimed}
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                    claimed
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/30 hover:scale-105 active:scale-95'
                  }`}
                >
                  {claimed ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>রিওয়ার্ড ওয়ালেটে যুক্ত হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>রিওয়ার্ড বোনাস সংগ্রহ করুন</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 border border-slate-700/80 text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>বিজ্ঞাপন শেষ হতে বাকি: {timeLeft} সেকেন্ড</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
