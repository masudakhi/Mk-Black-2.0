import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Clock, Sparkles } from 'lucide-react';
import { sound } from '../services/sound';

interface MathQuizProps {
  onReward: (taka: number, coins: number) => void;
  onExit: () => void;
}

interface Question {
  num1: number;
  num2: number;
  operator: '+' | '-' | '×';
  correctAnswer: number;
  options: number[];
}

function generateQuestion(): Question {
  const ops: Array<'+' | '-' | '×'> = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let n1 = 0;
  let n2 = 0;
  let ans = 0;

  if (op === '+') {
    n1 = Math.floor(10 + Math.random() * 40);
    n2 = Math.floor(5 + Math.random() * 35);
    ans = n1 + n2;
  } else if (op === '-') {
    n1 = Math.floor(30 + Math.random() * 50);
    n2 = Math.floor(5 + Math.random() * 25);
    ans = n1 - n2;
  } else {
    n1 = Math.floor(2 + Math.random() * 9);
    n2 = Math.floor(3 + Math.random() * 9);
    ans = n1 * n2;
  }

  // Generate 4 distinct options
  const optionsSet = new Set<number>([ans]);
  while (optionsSet.size < 4) {
    const offset = Math.floor(-8 + Math.random() * 16);
    if (offset !== 0) {
      optionsSet.add(ans + offset);
    }
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return { num1: n1, num2: n2, operator: op, correctAnswer: ans, options };
}

export const MathQuiz: React.FC<MathQuizProps> = ({ onReward, onExit }) => {
  const [question, setQuestion] = useState<Question>(generateQuestion);
  const [timeLeft, setTimeLeft] = useState(12);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      sound.playHit();
      setStreak(0);
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelect = (option: number) => {
    if (selectedAns !== null) return;
    setSelectedAns(option);

    if (option === question.correctAnswer) {
      sound.playCoin();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSolvedCount(prev => prev + 1);

      // Reward: ৳ 0.50 + 10 coins per right answer
      onReward(0.5, 10);
    } else {
      sound.playHit();
      setStreak(0);
    }

    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  const handleNext = () => {
    setSelectedAns(null);
    setTimeLeft(12);
    setQuestion(generateQuestion());
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
          <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>সফল: {solvedCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-full border border-rose-400/20 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          গণিত কুইজ রাশ
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          সঠিক উত্তর দিন এবং প্রতি সমাধানে নগদ ৳০.৫০ ও ১০ কয়েন নিন!
        </p>
      </div>

      {/* Problem Box */}
      <div className="py-8 px-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-center text-4xl font-black text-white tracking-wider tabular-nums shadow-inner mb-6">
        <span>{question.num1}</span>
        <span className="mx-3 text-cyan-400">{question.operator}</span>
        <span>{question.num2}</span>
        <span className="mx-3 text-slate-500">=</span>
        <span className="text-emerald-400">?</span>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {question.options.map(opt => {
          let btnStyle = 'bg-slate-800/80 hover:bg-slate-750 text-white border-slate-700';

          if (selectedAns !== null) {
            if (opt === question.correctAnswer) {
              btnStyle = 'bg-emerald-600 text-white border-emerald-400 animate-pulse';
            } else if (opt === selectedAns) {
              btnStyle = 'bg-rose-600 text-white border-rose-400';
            } else {
              btnStyle = 'opacity-40 bg-slate-800 text-slate-400';
            }
          }

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={selectedAns !== null}
              className={`py-4 rounded-2xl border text-xl font-black tabular-nums transition-all shadow-md active:scale-95 cursor-pointer ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {streak > 1 && (
        <div className="text-center text-xs font-bold text-amber-400 animate-bounce">
          🔥 {streak}টি সঠিক উত্তরের স্ট্রিক বোনাস সক্রিয়!
        </div>
      )}
    </div>
  );
};
