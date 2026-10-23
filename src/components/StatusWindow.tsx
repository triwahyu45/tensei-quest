import React from 'react';
import type { PlayerProfile, PlayerStats } from '../types';
import { Shield, Zap, Heart, Flame, Plus, Award } from 'lucide-react';
import { playSound } from '../utils/audio';

interface StatusWindowProps {
  player: PlayerProfile;
  onUpgradeStat: (statKey: keyof PlayerStats) => void;
}

export const StatusWindow: React.FC<StatusWindowProps> = ({ player, onUpgradeStat }) => {
  const hpPercent = Math.round((player.hp / player.maxHp) * 100);
  const mpPercent = Math.round((player.mp / player.maxMp) * 100);
  const fatiguePercent = Math.round((player.fatigue / player.maxFatigue) * 100);
  const expPercent = Math.round((player.exp / player.maxExp) * 100);

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'bg-amber-500 text-black border-amber-300';
      case 'A': return 'bg-purple-600 text-white border-purple-400';
      case 'B': return 'bg-blue-600 text-white border-blue-400';
      case 'C': return 'bg-emerald-600 text-white border-emerald-400';
      case 'D': return 'bg-cyan-600 text-white border-cyan-400';
      default: return 'bg-slate-700 text-cyan-300 border-slate-500';
    }
  };

  return (
    <div className="system-card rounded-xl p-5 md:p-6 text-cyan-50 shadow-2xl relative overflow-hidden">
      {/* Header Accent Line */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">System Notice</span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-wider text-white glow-text-blue mt-1">
            STATUS WINDOW
          </h1>
          <p className="text-xs md:text-sm text-cyan-300/80 font-mono">
            {player.name} &bull; NIM: {player.nim}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-1.5 rounded-lg border font-black text-xl tracking-wider shadow-lg ${getRankBadgeColor(player.rank)}`}>
            RANK {player.rank}
          </div>
          <div className="bg-cyan-950/80 border border-cyan-600/50 px-4 py-1.5 rounded-lg text-right">
            <span className="text-[10px] uppercase text-cyan-400 block tracking-wider font-mono">Current Level</span>
            <span className="text-2xl font-black text-cyan-300 font-mono">Lv. {player.level}</span>
          </div>
        </div>
      </div>

      {/* Title & Job */}
      <div className="my-4 bg-cyan-950/40 border border-cyan-900/60 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <span className="text-xs text-cyan-300 font-medium tracking-wide">Player Title:</span>
          <span className="text-sm font-bold text-white tracking-wide">{player.title}</span>
        </div>
        <div className="text-xs font-mono text-cyan-400">Class: Mechatronics Architect</div>
      </div>

      {/* Vital Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        {/* HP */}
        <div className="bg-slate-950/60 border border-red-950/60 rounded-lg p-3">
          <div className="flex justify-between text-xs mb-1 font-mono">
            <span className="text-red-400 font-bold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> HP (Kesehatan Mental)
            </span>
            <span className="text-red-300">{player.hp} / {player.maxHp}</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-red-900/30">
            <div className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all duration-500" style={{ width: `${hpPercent}%` }}></div>
          </div>
        </div>

        {/* MP */}
        <div className="bg-slate-950/60 border border-blue-950/60 rounded-lg p-3">
          <div className="flex justify-between text-xs mb-1 font-mono">
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> MP (Intelektual & Fokus)
            </span>
            <span className="text-blue-300">{player.mp} / {player.maxMp}</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-blue-900/30">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-500" style={{ width: `${mpPercent}%` }}></div>
          </div>
        </div>

        {/* Fatigue */}
        <div className="bg-slate-950/60 border border-amber-950/60 rounded-lg p-3">
          <div className="flex justify-between text-xs mb-1 font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Kelelahan (Fatigue)
            </span>
            <span className="text-amber-300">{player.fatigue}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-amber-900/30">
            <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-500" style={{ width: `${fatiguePercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* EXP Bar */}
      <div className="my-4 bg-slate-950/80 border border-cyan-900/40 rounded-lg p-3">
        <div className="flex justify-between text-xs mb-1 font-mono">
          <span className="text-cyan-400 font-bold tracking-wider">EXP BAR TO NEXT LEVEL</span>
          <span className="text-cyan-200">{player.exp} / {player.maxExp} XP ({expPercent}%)</span>
        </div>
        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-cyan-800/40">
          <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-300 h-full transition-all duration-500 shadow-lg glow-blue-sm" style={{ width: `${expPercent}%` }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="border-t border-cyan-800/60 pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold tracking-wider uppercase text-cyan-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Player Attribute Stats
          </h2>
          {player.statPoints > 0 && (
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/60 px-2.5 py-1 rounded-full animate-pulse">
              + {player.statPoints} STAT POINT AVAILABLE
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* STR */}
          <div className="bg-slate-950/70 border border-cyan-900/50 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase">Strength [STR]</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{player.stats.str}</div>
              <div className="text-[10px] text-slate-400 mt-1">Otot fisik & Calisthenics</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('str'); }}
                className="mt-2 w-full flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-1 rounded transition"
              >
                <Plus className="w-3 h-3" /> Add Point
              </button>
            )}
          </div>

          {/* AGI */}
          <div className="bg-slate-950/70 border border-cyan-900/50 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase">Agility [AGI]</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{player.stats.agi}</div>
              <div className="text-[10px] text-slate-400 mt-1">Konsistensi & Anti-Prokrastinasi</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('agi'); }}
                className="mt-2 w-full flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-1 rounded transition"
              >
                <Plus className="w-3 h-3" /> Add Point
              </button>
            )}
          </div>

          {/* VIT */}
          <div className="bg-slate-950/70 border border-cyan-900/50 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase">Vitality [VIT]</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{player.stats.vit}</div>
              <div className="text-[10px] text-slate-400 mt-1">Daya tahan & Anti-Depresi</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('vit'); }}
                className="mt-2 w-full flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-1 rounded transition"
              >
                <Plus className="w-3 h-3" /> Add Point
              </button>
            )}
          </div>

          {/* INT */}
          <div className="bg-slate-950/70 border border-cyan-900/50 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase">Intelligence [INT]</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{player.stats.int}</div>
              <div className="text-[10px] text-slate-400 mt-1">Mekatronika, PCB, Skripsi</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('int'); }}
                className="mt-2 w-full flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-1 rounded transition"
              >
                <Plus className="w-3 h-3" /> Add Point
              </button>
            )}
          </div>

          {/* PER */}
          <div className="bg-slate-950/70 border border-cyan-900/50 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase">Perception [PER]</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{player.stats.per}</div>
              <div className="text-[10px] text-slate-400 mt-1">Empati & Penguasaan Emosi</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('per'); }}
                className="mt-2 w-full flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-1 rounded transition"
              >
                <Plus className="w-3 h-3" /> Add Point
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
