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
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00e5ff', '#38bdf8', '#818cf8', '#ffffff'],
    });
    onClaimAllRewards();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical': return <Dumbbell className="w-4 h-4 text-cyan-400" />;
      case 'academic': return <BookOpen className="w-4 h-4 text-blue-400" />;
      default: return <Coffee className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="system-card rounded-xl p-5 md:p-6 text-cyan-50 shadow-2xl relative overflow-hidden">
      {/* Header Accent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyan-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">Daily Mandatory</span>
            <span className="text-[10px] bg-cyan-950 border border-cyan-600/40 text-cyan-300 px-2 py-0.5 rounded font-mono">
              Resets at 23:59
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white glow-text-blue mt-1">
            [QUEST: PREPARATION TO BECOME STRONG]
          </h2>
          <p className="text-xs text-cyan-300/80">
            Selesaikan seluruh tugas harian ini untuk memicu pemulihan hormon dan kenaikan level.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/90 border border-cyan-700/60 px-4 py-2 rounded-lg text-right font-mono">
            <span className="text-[10px] uppercase text-cyan-400 block tracking-wider">Progress</span>
            <span className="text-lg font-black text-cyan-300">{completedCount} / {quests.length} Done</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-4">
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-cyan-800/40">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500 shadow-md glow-blue-sm"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Quest Items List */}
      <div className="space-y-2.5 my-4">
        {quests.map((quest) => (
          <div
            key={quest.id}
            onClick={() => handleQuestCheck(quest.id)}
            className={`cursor-pointer rounded-lg p-3.5 border transition-all duration-300 flex items-center justify-between ${
              quest.completed
                ? 'bg-cyan-950/30 border-cyan-600/60 text-slate-300'
                : 'bg-slate-950/60 border-cyan-900/40 hover:border-cyan-500 hover:bg-slate-900/60 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <button className="text-cyan-400 hover:text-cyan-300 transition">
                {quest.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-950" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(quest.category)}
                  <span className={`text-sm font-semibold tracking-wide ${quest.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {quest.title}
                  </span>
                </div>
                <div className="text-xs text-cyan-400 font-mono mt-0.5">
                  Target: <span className="text-cyan-200">{quest.target}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-600/30 px-2.5 py-1 rounded">
                +{quest.xpReward} XP
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Claim Button / Status */}
      <div className="mt-5 pt-4 border-t border-cyan-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={handleClaim}
          disabled={!isAllCompleted}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-sm tracking-wider uppercase transition shadow-lg ${
            isAllCompleted
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 glow-blue cursor-pointer animate-pulse'
              : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {isAllCompleted ? '★ CLAIM DAILY QUEST REWARD ★' : 'Selesaikan Seluruh Quest untuk Klaim'}
        </button>

        {/* Penalty Simulation Trigger */}
        <button
          onClick={onTriggerPenaltyTest}
          className="w-full sm:w-auto text-xs text-red-400 hover:text-red-300 font-mono flex items-center justify-center gap-1.5 border border-red-900/60 bg-red-950/40 hover:bg-red-900/40 px-3 py-2 rounded transition"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Test 'Penalty Dungeon' Mode
        </button>
      </div>
    </div>
  );
};
