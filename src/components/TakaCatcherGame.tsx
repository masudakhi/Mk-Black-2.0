import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface TakaCatcherGameProps {
  onGameOverEarn: (taka: number, coins: number) => void;
  onExit: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'taka10' | 'taka50' | 'taka100' | 'bomb' | 'star';
  vy: number;
  size: number;
  value: number;
  points: number;
  rotation: number;
  rotSpeed: number;
}

export const TakaCatcherGame: React.FC<TakaCatcherGameProps> = ({ onGameOverEarn, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level game states
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover'>('title');
  const [finalScore, setFinalScore] = useState(0);
  const [earnedReward, setEarnedReward] = useState({ taka: 0, coins: 0 });
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('takacash_game_high') || '0', 10);
  });
  const [isMuted, setIsMuted] = useState(!sound.enabled);

  // References to keep game loop 60fps without React re-renders
  const stateRef = useRef<{
    score: number;
    lives: number;
    combo: number;
    basketX: number;
    basketWidth: number;
    basketHeight: number;
    basketTargetX: number;
    speed: number;
    items: FallingItem[];
    particles: Particle[];
    shakeTime: number;
    shakeIntensity: number;
    lastTime: number;
    spawnTimer: number;
    gameRunning: boolean;
    squashStretch: number;
    keys: { left: boolean; right: boolean; boost: boolean };
    comboTimer: number;
    canvasWidth: number;
    canvasHeight: number;
  }>({
    score: 0,
    lives: 3,
    combo: 0,
    basketX: 250,
    basketWidth: 80,
    basketHeight: 28,
    basketTargetX: 250,
    speed: 380,
    items: [],
    particles: [],
    shakeTime: 0,
    shakeIntensity: 0,
    lastTime: 0,
    spawnTimer: 0,
    gameRunning: false,
    squashStretch: 1,
    keys: { left: false, right: false, boost: false },
    comboTimer: 0,
    canvasWidth: 600,
    canvasHeight: 700,
  });

  // Spawn visual particle burst
  const spawnBurst = (x: number, y: number, color: string, count = 12) => {
    const p = stateRef.current.particles;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      p.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 3 + Math.random() * 5,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
      });
    }
  };

  // Start new run
  const startGame = useCallback(() => {
    sound.playClick();
    const st = stateRef.current;
    st.score = 0;
    st.lives = 3;
    st.combo = 0;
    st.comboTimer = 0;
    st.items = [];
    st.particles = [];
    st.shakeTime = 0;
    st.shakeIntensity = 0;
    st.squashStretch = 1;
    st.basketX = st.canvasWidth / 2;
    st.basketTargetX = st.basketX;
    st.gameRunning = true;
    st.lastTime = performance.now();
    st.spawnTimer = 0;
    setGameState('playing');
  }, []);

  // End game and calculate rewards
  const handleEndGame = useCallback((score: number) => {
    stateRef.current.gameRunning = false;
    sound.playHit();

    // Reward formula:
    // e.g. Score of 300 gives ৳2.50 Taka + 50 Coins!
    const rewardCoins = Math.max(10, Math.floor(score * 0.4));
    const rewardTaka = parseFloat((Math.max(0.5, score * 0.008)).toFixed(2));

    setFinalScore(score);
    setEarnedReward({ taka: rewardTaka, coins: rewardCoins });
    setGameState('gameover');

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('takacash_game_high', score.toString());
      sound.playFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }

    onGameOverEarn(rewardTaka, rewardCoins);
  }, [highScore, onGameOverEarn]);

  // Main 60fps Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      stateRef.current.canvasWidth = w;
      stateRef.current.canvasHeight = h;
      stateRef.current.basketX = Math.min(stateRef.current.basketX, w - 40);
    };

    resize();
    window.addEventListener('resize', resize);

    const update = (dt: number) => {
      const st = stateRef.current;
      if (!st.gameRunning) return;

      // Input handling for basket
      const speed = (st.keys.boost ? st.speed * 1.5 : st.speed) * dt;
      if (st.keys.left) st.basketX -= speed;
      if (st.keys.right) st.basketX += speed;

      // Mouse/Touch smooth interpolation
      if (Math.abs(st.basketTargetX - st.basketX) > 2) {
        st.basketX += (st.basketTargetX - st.basketX) * Math.min(1, dt * 14);
      }

      // Clamp basket position
      const halfW = st.basketWidth / 2;
      st.basketX = Math.max(halfW, Math.min(st.canvasWidth - halfW, st.basketX));

      // Squash and stretch return to 1
      st.squashStretch += (1 - st.squashStretch) * Math.min(1, dt * 10);

      // Camera shake decay
      if (st.shakeTime > 0) {
        st.shakeTime -= dt;
      }

      // Combo timer decay
      if (st.comboTimer > 0) {
        st.comboTimer -= dt;
        if (st.comboTimer <= 0) {
          st.combo = 0;
        }
      }

      // Item spawning
      st.spawnTimer += dt;
      const spawnInterval = Math.max(0.45, 1.1 - (st.score / 600) * 0.4);
      if (st.spawnTimer > spawnInterval) {
        st.spawnTimer = 0;
        const rand = Math.random();
        let type: FallingItem['type'] = 'coin';
        let value = 1;
        let points = 10;
        let size = 26;

        if (rand < 0.35) {
          type = 'coin';
          value = 1;
          points = 10;
          size = 24;
        } else if (rand < 0.6) {
          type = 'taka10';
          value = 10;
          points = 25;
          size = 32;
        } else if (rand < 0.78) {
          type = 'taka50';
          value = 50;
          points = 60;
          size = 36;
        } else if (rand < 0.88) {
          type = 'taka100';
          value = 100;
          points = 120;
          size = 40;
        } else if (rand < 0.94) {
          type = 'star';
          value = 2;
          points = 200;
          size = 32;
        } else {
          type = 'bomb';
          value = -1;
          points = 0;
          size = 28;
        }

        const fallSpeed = 160 + Math.random() * 80 + Math.min(140, st.score * 0.2);

        st.items.push({
          id: Math.random(),
          x: 20 + Math.random() * (st.canvasWidth - 40),
          y: -40,
          type,
          vy: fallSpeed,
          size,
          value,
          points,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 3,
        });
      }

      // Update falling items
      const basketTop = st.canvasHeight - 65;
      const basketBottom = basketTop + st.basketHeight;

      for (let i = st.items.length - 1; i >= 0; i--) {
        const item = st.items[i];
        item.y += item.vy * dt;
        item.rotation += item.rotSpeed * dt;

        // Check catch by basket
        const caught =
          item.y + item.size / 2 >= basketTop &&
          item.y - item.size / 2 <= basketBottom &&
          Math.abs(item.x - st.basketX) < (st.basketWidth / 2 + item.size / 3);

        if (caught) {
          st.items.splice(i, 1);
          st.squashStretch = 0.75; // Squash on impact

          if (item.type === 'bomb') {
            sound.playHit();
            st.shakeTime = 0.25;
            st.shakeIntensity = 8;
            st.combo = 0;
            st.lives -= 1;
            spawnBurst(item.x, item.y, '#ef4444', 16);

            if (st.lives <= 0) {
              handleEndGame(st.score);
              return;
            }
          } else {
            // Success pickup
            if (item.type === 'star') {
              sound.playCash();
              st.combo += 3;
              spawnBurst(item.x, item.y, '#f59e0b', 20);
            } else {
              sound.playCoin();
              st.combo += 1;
              const color = item.type === 'taka100' ? '#10b981' : item.type === 'taka50' ? '#ec4899' : '#eab308';
              spawnBurst(item.x, item.y, color, 12);
            }

            st.comboTimer = 2.2;
            const multiplier = 1 + Math.min(3, Math.floor(st.combo / 4) * 0.5);
            st.score += Math.round(item.points * multiplier);
          }
          continue;
        }

        // Missed item dropped off-screen
        if (item.y > st.canvasHeight + 40) {
          st.items.splice(i, 1);
          // Only drop lives if high-value note missed
          if (item.type === 'taka100' || item.type === 'star') {
            st.combo = 0;
          }
        }
      }

      // Update particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 320 * dt; // gravity
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          st.particles.splice(i, 1);
        }
      }
    };

    const render = () => {
      const st = stateRef.current;
      const w = st.canvasWidth;
      const h = st.canvasHeight;

      ctx.save();

      // Screen shake translation
      if (st.shakeTime > 0) {
        const dx = (Math.random() - 0.5) * st.shakeIntensity;
        const dy = (Math.random() - 0.5) * st.shakeIntensity;
        ctx.translate(dx, dy);
      }

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0a0f1d');
      bgGrad.addColorStop(1, '#07161b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle atmospheric grid dots
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      for (let x = 20; x < w; x += 40) {
        for (let y = 20; y < h; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw items
      st.items.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        if (item.type === 'coin') {
          // Gold coin
          ctx.beginPath();
          ctx.arc(0, 0, item.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#fbbf24';
          ctx.stroke();

          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('৳', 0, 1);
        } else if (item.type === 'taka10') {
          // 10 Taka note (pink-purple)
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.roundRect(-item.size / 2, -item.size / 3, item.size, item.size * 0.65, 4);
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('১০ ৳', 0, 0);
        } else if (item.type === 'taka50') {
          // 50 Taka note (Orange-red Nagad style)
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.roundRect(-item.size / 2, -item.size / 3, item.size, item.size * 0.65, 4);
          ctx.fill();
          ctx.strokeStyle = '#fdba74';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('৫০ ৳', 0, 0);
        } else if (item.type === 'taka100') {
          // 100 Taka note (Emerald green bKash style)
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.roundRect(-item.size / 2, -item.size / 3, item.size, item.size * 0.65, 5);
          ctx.fill();
          ctx.strokeStyle = '#6ee7b7';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('১০০ ৳', 0, 0);
        } else if (item.type === 'star') {
          // 2X Bonus diamond
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(0, -item.size / 2);
          ctx.lineTo(item.size / 2, 0);
          ctx.lineTo(0, item.size / 2);
          ctx.lineTo(-item.size / 2, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#0369a1';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('2X', 0, 0);
        } else if (item.type === 'bomb') {
          // Bomb
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(0, 2, item.size / 2.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Fuse
          ctx.beginPath();
          ctx.moveTo(0, -item.size / 2.3);
          ctx.lineTo(4, -item.size / 1.7);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(4, -item.size / 1.7, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✕', 0, 2);
        }

        ctx.restore();
      });

      // Draw Basket (Taka Cash Wallet / Bag)
      const basketY = h - 65;
      ctx.save();
      ctx.translate(st.basketX, basketY + st.basketHeight / 2);
      ctx.scale(1 / st.squashStretch, st.squashStretch);

      // Basket glow
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;

      // Basket body
      const bw = st.basketWidth;
      const bh = st.basketHeight;
      const bGrad = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2);
      bGrad.addColorStop(0, '#047857');
      bGrad.addColorStop(1, '#065f46');

      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.roundRect(-bw / 2, -bh / 2, bw, bh, [4, 4, 16, 16]);
      ctx.fill();

      // Rim
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(-bw / 2 - 4, -bh / 2 - 4, bw + 8, 8, 4);
      ctx.fill();

      // Label
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('টাকা ব্যাগ', 0, 2);

      ctx.restore();

      // Draw particles
      st.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Perimeter Low-occlusion HUD
      if (st.gameRunning) {
        // Top Left: Score and Combo
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.roundRect(16, 16, 140, 52, 10);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('স্কোর', 26, 32);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px "Outfit", sans-serif';
        ctx.fillText(`${st.score}`, 26, 56);

        if (st.combo > 1) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`${st.combo}x কম্বো!`, 146, 54);
        }

        // Top Right: Lives
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.roundRect(w - 110, 16, 94, 44, 10);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        let hearts = '';
        for (let l = 0; l < 3; l++) {
          hearts += l < st.lives ? '❤️ ' : '🖤 ';
        }
        ctx.fillText(hearts.trim(), w - 63, 44);
      }

      ctx.restore();
    };

    const loop = (timestamp: number) => {
      const rawDt = (timestamp - stateRef.current.lastTime) / 1000;
      stateRef.current.lastTime = timestamp;
      const dt = Math.min(rawDt, 0.05); // clamp

      update(dt);
      render();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [handleEndGame]);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const st = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        st.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        st.keys.right = true;
      }
      if (e.key === ' ' || e.key === 'Shift') {
        st.keys.boost = true;
      }
      if (e.key === 'Escape') {
        setGameState(prev => {
          if (prev === 'playing') {
            st.gameRunning = false;
            return 'paused';
          } else if (prev === 'paused') {
            st.gameRunning = true;
            st.lastTime = performance.now();
            return 'playing';
          }
          return prev;
        });
      }
      if (e.key === 'Enter' && (gameState === 'title' || gameState === 'gameover')) {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const st = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') st.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') st.keys.right = false;
      if (e.key === ' ' || e.key === 'Shift') st.keys.boost = false;
    };

    const handleBlur = () => {
      const st = stateRef.current;
      st.keys.left = false;
      st.keys.right = false;
      st.keys.boost = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, startGame]);

  // Pointer / Touch move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stateRef.current.gameRunning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    stateRef.current.basketTargetX = x;
  };

  const toggleMute = () => {
    sound.enabled = !sound.enabled;
    setIsMuted(!sound.enabled);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="relative w-full h-[620px] max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#070b13] select-none"
    >
      {/* 60fps Isolated HTML5 Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-8 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          {/* Top Bar with exit & mute */}
          <div className="w-full flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ফিরে যান</span>
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 text-xs"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Bespoke inline SVG Title Lockup with 35% negative space */}
          <div className="text-center my-auto flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-0.5 shadow-xl shadow-emerald-500/30 mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                <span className="text-4xl">💰</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 tracking-tight mb-2">
              টাকা রাশ (Taka Rush)
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              পড়ন্ত বিকাশ, নগদ ও কয়েন কুড়িয়ে আপনার ওয়ালেট পূর্ণ করুন! যত বেশি স্কোর, তত বেশি ক্যাশ টাকা!
            </p>

            {highScore > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-6">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>আপনার সেরা স্কোর: {highScore}</span>
              </div>
            )}

            {/* Primary Start CTA Button */}
            <button
              onClick={startGame}
              className="group px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>খেলা শুরু করুন</span>
            </button>

            {/* Control Hint Line */}
            <p className="mt-4 text-[12px] text-slate-400 font-mono">
              A / D বা এরো কি ডানে-বামে · স্পেস বোতাম স্পিড · মাউস ড্র্যাগ
            </p>
          </div>

          {/* Reward Badges */}
          <div className="w-full flex items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> ১০০ ৳ নোট = ১২০ পয়েন্ট
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> স্টার = ২X বোনাস
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> বোমা এড়িয়ে চলুন (-১ জীবন)
            </span>
          </div>
        </div>
      )}

      {/* Paused Modal */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">খেলা সাময়িক স্থগিত</h3>
            <p className="text-slate-400 text-sm mb-6">একটু বিশ্রাম নিন অথবা আবার খেলা শুরু করুন</p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  stateRef.current.gameRunning = true;
                  stateRef.current.lastTime = performance.now();
                  setGameState('playing');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm"
              >
                চালিয়ে যান
              </button>
              <button
                onClick={startGame}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm"
              >
                পুনরায় শুরু করুন
              </button>
              <button
                onClick={onExit}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                গেম থেকে বের হন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm animate-fade-in p-6">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">অভিনন্দন! গেম শেষ হয়েছে</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-5">
              আপনি দারুণ খেলেছেন! আপনার অর্জিত টাকা ও কয়েন ওয়ালেটে যুক্ত করা হয়েছে।
            </p>

            {/* Score & Rewards Box */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 mb-6">
              <div>
                <div className="text-[11px] text-slate-400">স্কোর</div>
                <div className="text-lg font-black text-white tabular-nums">{finalScore}</div>
              </div>
              <div className="border-x border-slate-800">
                <div className="text-[11px] text-emerald-400 font-semibold">টাকা আয়</div>
                <div className="text-lg font-black text-emerald-300 tabular-nums">৳ {earnedReward.taka}</div>
              </div>
              <div>
                <div className="text-[11px] text-amber-400 font-semibold">কয়েন আয়</div>
                <div className="text-lg font-black text-amber-300 tabular-nums">+{earnedReward.coins}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>আবার খেলুন</span>
              </button>
              <button
                onClick={onExit}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
              >
                মেনুতে যান
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-game quick top controls */}
      {gameState === 'playing' && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => {
              stateRef.current.gameRunning = false;
              setGameState('paused');
            }}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-sm"
            title="Pause (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
