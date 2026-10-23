import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Sparkles, Trophy, RotateCcw, Video, ArrowLeft } from 'lucide-react';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface SpinWheelProps {
  onReward: (taka: number, coins: number) => void;
  onWatchAdForSpin: () => void;
  onExit: () => void;
}

interface WheelSegment {
  label: string;
  sub: string;
  taka: number;
  coins: number;
  color: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: '৳ ১.০০', sub: 'ক্যাশ টাকা', taka: 1, coins: 0, color: '#059669' },
  { label: '৫০ কয়েন', sub: 'পয়েন্ট', taka: 0, coins: 50, color: '#f59e0b' },
  { label: '৳ ২.৫০', sub: 'ক্যাশ টাকা', taka: 2.5, coins: 0, color: '#0d9488' },
  { label: '১০০ কয়েন', sub: 'পয়েন্ট', taka: 0, coins: 100, color: '#e11d48' },
  { label: '৳ ৫.০০', sub: 'মেগা ক্যাশ', taka: 5, coins: 0, color: '#7c3aed' },
  { label: '২০ কয়েন', sub: 'পয়েন্ট', taka: 0, coins: 20, color: '#ea580c' },
  { label: '৳ ১০.০০', sub: 'সুপার উইন', taka: 10, coins: 0, color: '#2563eb' },
  { label: '২০০ কয়েন', sub: 'জ্যাকপট', taka: 0, coins: 200, color: '#d97706' },
];

export const SpinWheel: React.FC<SpinWheelProps> = ({ onReward, onWatchAdForSpin, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [freeSpins, setFreeSpins] = useState(() => {
    return parseInt(localStorage.getItem('takacash_spins_left') || '5', 10);
  });
  const [wonSegment, setWonSegment] = useState<WheelSegment | null>(null);

  const angleRef = useRef(0);
  const animRef = useRef<number | null>(null);

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 16;
    const numSegments = SEGMENTS.length;
    const arc = (Math.PI * 2) / numSegments;

    ctx.clearRect(0, 0, size, size);

    // Outer border ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Outer bulbs
    const bulbCount = 24;
    for (let i = 0; i < bulbCount; i++) {
      const bAngle = (i * Math.PI * 2) / bulbCount;
      const bx = center + Math.cos(bAngle) * (radius + 4);
      const by = center + Math.sin(bAngle) * (radius + 4);
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#ffffff';
      ctx.fill();
    }

    // Draw slices
    SEGMENTS.forEach((seg, i) => {
      const segAngle = angle + i * arc;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, segAngle, segAngle + arc);
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text inside segment
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(segAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(seg.label, radius - 24, 4);

      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(seg.sub, radius - 24, 18);
      ctx.restore();
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('৳', center, center);
  }, []);

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [drawWheel]);

  const spin = () => {
    if (spinning || freeSpins <= 0) return;

    sound.playClick();
    setSpinning(true);
    setWonSegment(null);

    const newSpins = freeSpins - 1;
    setFreeSpins(newSpins);
    localStorage.setItem('takacash_spins_left', newSpins.toString());

    // Choose random prize with weighted distribution
    const prizeIndex = Math.floor(Math.random() * SEGMENTS.length);
    const numSegments = SEGMENTS.length;
    const arc = (Math.PI * 2) / numSegments;

    // Pointer is at the top (angle -PI/2 or 3PI/2)
    // To land on prizeIndex: angle + prizeIndex * arc + arc/2 = 3 * PI / 2 (mod 2PI)
    const targetAngle = (3 * Math.PI) / 2 - (prizeIndex * arc + arc / 2);
    const extraRounds = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const totalRotation = extraRounds * Math.PI * 2 + (targetAngle - (angleRef.current % (Math.PI * 2)));

    const startAngle = angleRef.current;
    const duration = 4000; // 4 seconds
    const startTime = performance.now();
    let lastTickAngle = startAngle;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalRotation * ease;
      angleRef.current = currentAngle;

      // Sound tick on passing segment lines
      if (Math.abs(currentAngle - lastTickAngle) >= arc) {
        sound.playTick();
        lastTickAngle = currentAngle;
      }

      drawWheel(currentAngle);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animateSpin);
      } else {
        setSpinning(false);
        const won = SEGMENTS[prizeIndex];
        setWonSegment(won);

        if (won.taka > 0) {
          sound.playCash();
        } else {
          sound.playCoin();
        }

        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        onReward(won.taka, won.coins);
      }
    };

    animRef.current = requestAnimationFrame(animateSpin);
  };

  const addBonusSpins = () => {
    sound.playClick();
    onWatchAdForSpin();
    setFreeSpins(prev => {
      const updated = prev + 3;
      localStorage.setItem('takacash_spins_left', updated.toString());
      return updated;
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">বাকি স্পিন:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-xs tabular-nums">
            {freeSpins} টি
          </span>
        </div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
          ভাগ্য চাকা (Lucky Wheel)
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          চাকা ঘুরিয়ে প্রতি স্পিনে নিশ্চিত নগদ টাকা অথবা কয়েন জিতে নিন!
        </p>
      </div>

      {/* Wheel Canvas Container with Top Pointer Arrow */}
      <div className="relative flex justify-center items-center my-4">
        {/* Top Pointer */}
        <div className="absolute top-0 z-20 -mt-2">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 filter drop-shadow-md"></div>
        </div>

        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="max-w-full drop-shadow-2xl"
        />
      </div>

      {/* Result Display */}
      {wonSegment && !spinning && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 text-center my-3 animate-fade-in">
          <div className="text-xs text-emerald-300 font-medium">অভিনন্দন! আপনি জিতেছেন:</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">
            {wonSegment.taka > 0 ? `৳ ${wonSegment.taka.toFixed(2)} টাকা` : `+${wonSegment.coins} কয়েন`}
          </div>
        </div>
      )}

      {/* Spin Controls */}
      <div className="flex flex-col gap-2.5 mt-4">
        <button
          onClick={spin}
          disabled={spinning || freeSpins <= 0}
          className={`w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
            spinning || freeSpins <= 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-amber-500/30 hover:scale-102 active:scale-98 cursor-pointer'
          }`}
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span>{spinning ? 'চাকা ঘুরছে...' : freeSpins > 0 ? 'চাকা ঘুরান (SPIN NOW)' : 'স্পিন শেষ!'}</span>
        </button>

        {freeSpins <= 0 && (
          <button
            onClick={addBonusSpins}
            className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Video className="w-4 h-4 text-purple-400" />
            <span>অ্যাড দেখে আরো ৩টি ফ্রি স্পিন নিন</span>
          </button>
        )}
      </div>
    </div>
  );
};
