import React from 'react';
import type { PlayerProfile, PlayerStats } from '../types';
import { Shield, Zap, Heart, Flame, Plus, Award, ChevronUp } from 'lucide-react';
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
      case 'S': return 'bg-amber-500 text-black border-amber-300 shadow-amber-500/50';
      case 'A': return 'bg-purple-600 text-white border-purple-400 shadow-purple-500/50';
      case 'B': return 'bg-blue-600 text-white border-blue-400 shadow-blue-500/50';
      case 'C': return 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/50';
      case 'D': return 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-500/50';
      default: return 'bg-slate-700 text-cyan-300 border-slate-500';
    }
  };

  return (
    <div className="system-card rounded-2xl p-5 md:p-7 text-cyan-50 shadow-2xl relative overflow-hidden">
      {/* Header Accent Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
              [SYSTEM NOTICE]
            </span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider text-white glow-text-blue mt-1">
            STATUS WINDOW
          </h1>
          <p className="text-xs sm:text-sm text-cyan-300/80 font-mono mt-0.5">
            Player: <span className="text-white font-bold">{player.name}</span> &bull; {player.nim}
          </p>
        </div>

        {/* Rank & Level Badges */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border-2 font-black text-xl md:text-2xl tracking-wider shadow-lg animate-rank-aura ${getRankBadgeColor(player.rank)}`}>
            RANK {player.rank}
          </div>
          <div className="bg-cyan-950/90 border border-cyan-500/50 px-4 py-2 rounded-xl text-right">
            <span className="text-xs uppercase text-cyan-400 block tracking-wider font-mono font-bold">Level</span>
            <span className="text-2xl md:text-3xl font-black text-cyan-300 font-mono">Lv. {player.level}</span>
          </div>
        </div>
      </div>

      {/* Title & Job */}
      <div className="my-4 bg-cyan-950/40 border border-cyan-800/60 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <span className="text-xs text-cyan-300 block font-mono">Hunter Title:</span>
            <span className="text-sm sm:text-base font-bold text-white tracking-wide">{player.title}</span>
          </div>
        </div>
        <div className="text-xs sm:text-sm font-mono text-cyan-400 font-bold bg-cyan-950/90 border border-cyan-800 px-3 py-1 rounded-lg self-start sm:self-auto">
          Class: Awakened Vanguard
        </div>
      </div>

      {/* Vital Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
        {/* HP */}
        <div className="bg-slate-950/70 border border-red-950/70 rounded-xl p-3.5 shadow-sm">
          <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-mono">
            <span className="text-red-400 font-bold flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> HP (Kesehatan Mental)
            </span>
            <span className="text-red-200 font-bold">{player.hp} / {player.maxHp}</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-red-900/40">
            <div className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all duration-500" style={{ width: `${hpPercent}%` }}></div>
          </div>
        </div>

        {/* MP */}
        <div className="bg-slate-950/70 border border-blue-950/70 rounded-xl p-3.5 shadow-sm">
          <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-mono">
            <span className="text-blue-400 font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> MP (Fokus & Intelektual)
            </span>
            <span className="text-blue-200 font-bold">{player.mp} / {player.maxMp}</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-blue-900/40">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-500" style={{ width: `${mpPercent}%` }}></div>
          </div>
        </div>

        {/* Fatigue */}
        <div className="bg-slate-950/70 border border-amber-950/70 rounded-xl p-3.5 shadow-sm">
          <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> Kelelahan (Fatigue)
            </span>
            <span className="text-amber-200 font-bold">{player.fatigue}%</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-amber-900/40">
            <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-500" style={{ width: `${fatiguePercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* EXP Bar */}
      <div className="my-4 bg-slate-950/80 border border-cyan-900/50 rounded-xl p-3.5">
        <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-mono">
          <span className="text-cyan-400 font-bold tracking-wider">EXP BAR TO NEXT LEVEL</span>
          <span className="text-cyan-200 font-bold">{player.exp} / {player.maxExp} XP ({expPercent}%)</span>
        </div>
        <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden border border-cyan-800/50">
          <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-300 h-full transition-all duration-500 shadow-lg glow-blue-sm" style={{ width: `${expPercent}%` }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="border-t border-cyan-800/60 pt-4 mt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm sm:text-base font-bold tracking-wider uppercase text-cyan-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Player Attribute Stats
          </h2>
          {player.statPoints > 0 && (
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/70 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
              <ChevronUp className="w-4 h-4 text-amber-400" /> +{player.statPoints} STAT POINT TERSEDIA
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {/* STR */}
          <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="text-xs text-cyan-400 font-mono font-bold uppercase">STR (Strength)</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{player.stats.str}</div>
              <div className="text-xs text-slate-300 mt-1">Otot fisik & Push-up</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('str'); }}
                className="mt-3 w-full min-h-[44px] flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 rounded-lg transition active:scale-95 shadow glow-blue-sm"
              >
                <Plus className="w-4 h-4" /> Add Stat
              </button>
            )}
          </div>

          {/* AGI */}
          <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="text-xs text-cyan-400 font-mono font-bold uppercase">AGI (Agility)</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{player.stats.agi}</div>
              <div className="text-xs text-slate-300 mt-1">Konsistensi & Anti-Mager</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('agi'); }}
                className="mt-3 w-full min-h-[44px] flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 rounded-lg transition active:scale-95 shadow glow-blue-sm"
              >
                <Plus className="w-4 h-4" /> Add Stat
              </button>
            )}
          </div>

          {/* VIT */}
          <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="text-xs text-cyan-400 font-mono font-bold uppercase">VIT (Vitality)</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{player.stats.vit}</div>
              <div className="text-xs text-slate-300 mt-1">Daya tahan & Anti-Depresi</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('vit'); }}
                className="mt-3 w-full min-h-[44px] flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 rounded-lg transition active:scale-95 shadow glow-blue-sm"
              >
                <Plus className="w-4 h-4" /> Add Stat
              </button>
            )}
          </div>

          {/* INT */}
          <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="text-xs text-cyan-400 font-mono font-bold uppercase">INT (Intellect)</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{player.stats.int}</div>
              <div className="text-xs text-slate-300 mt-1">Mekatronika, PCB, Skripsi</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('int'); }}
                className="mt-3 w-full min-h-[44px] flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 rounded-lg transition active:scale-95 shadow glow-blue-sm"
              >
                <Plus className="w-4 h-4" /> Add Stat
              </button>
            )}
          </div>

          {/* PER */}
          <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div>
              <div className="text-xs text-cyan-400 font-mono font-bold uppercase">PER (Perception)</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{player.stats.per}</div>
              <div className="text-xs text-slate-300 mt-1">Fokus & Penguasaan Emosi</div>
            </div>
            {player.statPoints > 0 && (
              <button
                onClick={() => { playSound.statPoint(); onUpgradeStat('per'); }}
                className="mt-3 w-full min-h-[44px] flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 rounded-lg transition active:scale-95 shadow glow-blue-sm"
              >
                <Plus className="w-4 h-4" /> Add Stat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
