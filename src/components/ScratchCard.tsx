import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, RotateCcw, Video } from 'lucide-react';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface ScratchCardProps {
  onReward: (taka: number, coins: number) => void;
  onWatchAdForCard: () => void;
  onExit: () => void;
}

const REWARDS_POOL = [
  { taka: 2.0, coins: 20, text: '৳ ২.০০ টাকা' },
  { taka: 3.5, coins: 40, text: '৳ ৩.৫০ টাকা' },
  { taka: 5.0, coins: 50, text: '৳ ৫.০০ টাকা' },
  { taka: 1.5, coins: 15, text: '৳ ১.৫০ টাকা' },
  { taka: 8.0, coins: 100, text: '৳ ৮.০০ মেগা প্রাইজ' },
  { taka: 0.0, coins: 150, text: '১৫০ কয়েন' },
];

export const ScratchCard: React.FC<ScratchCardProps> = ({ onReward, onWatchAdForCard, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cardsLeft, setCardsLeft] = useState(() => {
    return parseInt(localStorage.getItem('takacash_scratch_cards') || '4', 10);
  });
  const [currentPrize, setCurrentPrize] = useState(() => {
    return REWARDS_POOL[Math.floor(Math.random() * REWARDS_POOL.length)];
  });
  const [isRevealed, setIsRevealed] = useState(false);
  const isScratchingRef = useRef(false);

  // Initialize and reset canvas surface
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';

    // Metallic silver-gold scratch foil
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#64748b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative patterns on foil
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.fillRect(i, 0, 10, canvas.height);
    }

    // Text on foil
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('এখানে ঘষে গোপন পুরস্কার দেখুন', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('👉 স্ক্র্যাচ করুন 👈', canvas.width / 2, canvas.height / 2 + 16);
  };

  useEffect(() => {
    initCanvas();
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    sound.playTick();

    // Check progress
    checkRevealProgress();
  };

  const checkRevealProgress = () => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    const totalPixels = imgData.data.length / 4;

    for (let i = 3; i < imgData.data.length; i += 16) {
      if (imgData.data[i] === 0) {
        transparentPixels += 4;
      }
    }

    // If 40% cleared, reveal full prize
    if (transparentPixels / totalPixels > 0.38) {
      setIsRevealed(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (currentPrize.taka > 0) {
        sound.playCash();
      } else {
        sound.playCoin();
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onReward(currentPrize.taka, currentPrize.coins);

      const nextCards = Math.max(0, cardsLeft - 1);
      setCardsLeft(nextCards);
      localStorage.setItem('takacash_scratch_cards', nextCards.toString());
    }
  };

  const handleNextCard = () => {
    if (cardsLeft <= 0) return;
    sound.playClick();
    setIsRevealed(false);
    setCurrentPrize(REWARDS_POOL[Math.floor(Math.random() * REWARDS_POOL.length)]);
    setTimeout(() => {
      initCanvas();
    }, 50);
  };

  const addBonusCards = () => {
    sound.playClick();
    onWatchAdForCard();
    setCardsLeft(prev => {
      const updated = prev + 3;
      localStorage.setItem('takacash_scratch_cards', updated.toString());
      return updated;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">কার্ড বাকি:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-xs tabular-nums">
            {cardsLeft} টি
          </span>
        </div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
          স্ক্র্যাচ অ্যান্ড উইন
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          কার্ডটি হাত বা মাউস দিয়ে ঘষুন এবং নগদ টাকা জিতে নিন!
        </p>
      </div>

      {/* Scratch Box Container */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-inner flex items-center justify-center my-3 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950">
        {/* Underlying Hidden Prize View */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-0">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mb-2">
            🎉
          </div>
          <div className="text-xs text-slate-300 font-semibold">আপনার পুরস্কার:</div>
          <div className="text-2xl font-black text-emerald-400 my-1">{currentPrize.text}</div>
          <div className="text-[11px] text-amber-300">+{currentPrize.coins} বোনাস পয়েন্ট</div>
        </div>

        {/* Scratchable Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={360}
          height={224}
          onMouseDown={() => (isScratchingRef.current = true)}
          onMouseUp={() => (isScratchingRef.current = false)}
          onMouseLeave={() => (isScratchingRef.current = false)}
          onMouseMove={e => {
            if (isScratchingRef.current) scratch(e.clientX, e.clientY);
          }}
          onTouchStart={() => (isScratchingRef.current = true)}
          onTouchEnd={() => (isScratchingRef.current = false)}
          onTouchMove={e => {
            const touch = e.touches[0];
            scratch(touch.clientX, touch.clientY);
          }}
          className={`absolute inset-0 z-10 w-full h-full cursor-pointer transition-opacity duration-500 ${
            isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col gap-2.5">
        {isRevealed && cardsLeft > 0 && (
          <button
            onClick={handleNextCard}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-102 active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>পরবর্তী কার্ড ঘষুন</span>
          </button>
        )}

        {cardsLeft <= 0 && (
          <button
            onClick={addBonusCards}
            className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Video className="w-4 h-4 text-purple-400" />
            <span>ভিডিও অ্যাড দেখে আরো ৩টি স্ক্র্যাচ কার্ড পান</span>
          </button>
        )}
      </div>
    </div>
  );
};
