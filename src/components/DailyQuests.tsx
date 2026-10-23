import React from 'react';
import type { DailyQuest } from '../types';
import { CheckCircle2, Circle, Dumbbell, BookOpen, Coffee, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';

interface DailyQuestsProps {
  quests: DailyQuest[];
  onToggleQuest: (questId: string) => void;
  onClaimAllRewards: () => void;
  onTriggerPenaltyTest: () => void;
}

export const DailyQuests: React.FC<DailyQuestsProps> = ({
  quests,
  onToggleQuest,
  onClaimAllRewards,
  onTriggerPenaltyTest,
}) => {
  const completedCount = quests.filter((q) => q.completed).length;
  const isAllCompleted = completedCount === quests.length && quests.length > 0;
  const progressPercent = Math.round((completedCount / quests.length) * 100);

  const handleQuestCheck = (id: string) => {
    playSound.questComplete();
    onToggleQuest(id);
  };

  const handleClaim = () => {
    playSound.levelUp();
    confetti({
      particleCount: 140,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#00e5ff', '#38bdf8', '#fbbf24', '#ffffff'],
    });
    onClaimAllRewards();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical': return <Dumbbell className="w-5 h-5 text-cyan-400 shrink-0" />;
      case 'academic': return <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />;
      default: return <Coffee className="w-5 h-5 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div className="system-card rounded-2xl p-5 md:p-7 text-cyan-50 shadow-2xl relative overflow-hidden">
      {/* Header Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
              [DAILY MANDATORY PROTOCOL]
            </span>
            <span className="text-xs bg-cyan-950 border border-cyan-600/50 text-cyan-300 px-2.5 py-0.5 rounded font-mono">
              Reset Tiap 23:59
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white glow-text-blue mt-1">
            PREPARATION TO BECOME STRONG
          </h2>
          <p className="text-xs sm:text-sm text-cyan-300/80 mt-0.5">
            Selesaikan seluruh tugas harian ini untuk memulihkan dopamine otak dan naik level.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="self-start sm:self-auto">
          <div className="bg-slate-950/90 border border-cyan-600/60 px-4 py-2.5 rounded-xl text-right font-mono">
            <span className="text-xs uppercase text-cyan-400 block tracking-wider font-bold">Progress</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-300">{completedCount} / {quests.length} Selesai</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-4">
        <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden border border-cyan-800/50">
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full transition-all duration-500 shadow-md glow-blue-sm"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Quest Items List */}
      <div className="space-y-3 my-4">
        {quests.map((quest) => (
          <div
            key={quest.id}
            onClick={() => handleQuestCheck(quest.id)}
            className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 flex items-center justify-between gap-3 active:scale-[0.99] min-h-[64px] ${
              quest.completed
                ? 'bg-cyan-950/25 border-cyan-600/50 text-slate-400'
                : 'bg-slate-950/80 border-cyan-900/60 hover:border-cyan-400 hover:bg-slate-900/80 text-white shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3.5 flex-1">
              <button className="text-cyan-400 transition shrink-0 p-1">
                {quest.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-cyan-400 fill-cyan-950" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-500" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(quest.category)}
                  <span className={`text-sm sm:text-base font-bold tracking-wide ${quest.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {quest.title}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-cyan-400 font-mono mt-1">
                  Target: <span className="text-white font-semibold">{quest.target}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/70 border border-amber-600/40 px-3 py-1.5 rounded-lg shadow-sm">
                +{quest.xpReward} XP
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Claim Button / Status */}
      <div className="mt-6 pt-4 border-t border-cyan-800/60 flex flex-col sm:flex-row items-center justify-between gap-3.5">
        <button
          onClick={handleClaim}
          disabled={!isAllCompleted}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm sm:text-base tracking-wider uppercase transition shadow-xl min-h-[50px] ${
            isAllCompleted
              ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white hover:from-cyan-400 hover:to-blue-500 glow-blue cursor-pointer animate-pulse'
              : 'bg-slate-900/90 text-slate-500 border border-slate-800 cursor-not-allowed'
          }`}
        >
          {isAllCompleted ? '★ CLAIM DAILY QUEST REWARD ★' : 'Selesaikan Seluruh Quest untuk Klaim'}
        </button>

        {/* Penalty Simulation Trigger */}
        <button
          onClick={onTriggerPenaltyTest}
          className="w-full sm:w-auto text-xs text-red-400 hover:text-red-300 font-mono flex items-center justify-center gap-2 border border-red-900/70 bg-red-950/50 hover:bg-red-900/50 px-4 py-2.5 rounded-xl transition min-h-[44px]"
        >
          <AlertTriangle className="w-4 h-4" /> Test 'Penalty Dungeon' Mode
        </button>
      </div>
    </div>
  );
};
