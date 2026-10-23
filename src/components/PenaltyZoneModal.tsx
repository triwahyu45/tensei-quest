import React from 'react';
import type { PenaltyZoneState } from '../types';
import { Skull, AlertOctagon, CheckSquare, Square, Unlock } from 'lucide-react';
import { playSound } from '../utils/audio';

interface PenaltyZoneModalProps {
  penalty: PenaltyZoneState;
  onTogglePenaltyTask: (taskId: string) => void;
  onClearPenalty: () => void;
}

export const PenaltyZoneModal: React.FC<PenaltyZoneModalProps> = ({
  penalty,
  onTogglePenaltyTask,
  onClearPenalty,
}) => {
  if (!penalty.isActive) return null;

  const isAllPenaltyCompleted = penalty.tasks.every((t) => t.completed);

  const handleToggle = (id: string) => {
    playSound.questComplete();
    onTogglePenaltyTask(id);
  };

  const handleRedeem = () => {
    playSound.levelUp();
    onClearPenalty();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="system-card-red w-full max-w-xl rounded-2xl p-6 md:p-8 text-rose-50 shadow-2xl border-2 border-red-600 glow-red relative overflow-hidden">
        {/* Warning Badge */}
        <div className="flex items-center justify-between border-b border-red-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Skull className="w-7 h-7 text-red-500 animate-pulse" />
            <div>
              <span className="text-xs uppercase tracking-widest text-red-400 font-mono font-bold block">
                [SYSTEM WARNING: PENALTY ZONE ACTIVATED]
              </span>
              <h2 className="text-2xl font-black text-white glow-text-red">
                ZONA HUKUMAN: PENEBUSAN KEMALASAN
              </h2>
            </div>
          </div>
          <AlertOctagon className="w-8 h-8 text-red-500" />
        </div>

        <div className="my-4 bg-red-950/60 border border-red-900/80 rounded-lg p-3 text-xs leading-relaxed text-red-200">
          <strong>Peringatan Sistem:</strong> {penalty.reason} Sistem dikunci secara penuh sampai kamu menuntaskan denda fisik di bawah ini tanpa kompromi.
        </div>

        {/* Penalty Tasks */}
        <div className="space-y-3 my-5">
          {penalty.tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggle(task.id)}
              className={`cursor-pointer rounded-lg p-4 border transition-all duration-300 flex items-center justify-between ${
                task.completed
                  ? 'bg-red-950/30 border-red-700/60 text-slate-400'
                  : 'bg-red-950/80 border-red-600/60 hover:border-red-400 text-white shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <button className="text-red-400">
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-red-400" />
                  ) : (
                    <Square className="w-5 h-5 text-red-600" />
                  )}
                </button>
                <div>
                  <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-red-300/80 font-mono mt-0.5">
                    Target Eksekusi: <span className="font-bold text-white">{task.target}</span>
                  </p>
                </div>
              </div>

              <div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                  task.completed ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-900 text-red-200 border-red-700'
                }`}>
                  {task.completed ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Unlock Button */}
        <div className="border-t border-red-800/80 pt-4 flex justify-end">
          <button
            onClick={handleRedeem}
            disabled={!isAllPenaltyCompleted}
            className={`w-full py-3 rounded-lg font-black text-sm tracking-widest uppercase transition flex items-center justify-center gap-2 shadow-xl ${
              isAllPenaltyCompleted
                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white hover:from-red-500 hover:to-rose-400 glow-red cursor-pointer animate-pulse'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Unlock className="w-4 h-4" />
            {isAllPenaltyCompleted ? 'TEBUS HUKUMAN & BUKA KUNCI SISTEM' : 'SELESAIKAN SEMUA DENDA UNTUK BUKA SISTEM'}
          </button>
        </div>
      </div>
    </div>
  );
};
