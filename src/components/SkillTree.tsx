import React from 'react';
import type { SkillItem } from '../types';
import { Lock, Unlock, Trophy, Cpu, Eye, ScrollText, GraduationCap, Dumbbell } from 'lucide-react';

interface SkillTreeProps {
  skills: SkillItem[];
}

export const SkillTree: React.FC<SkillTreeProps> = ({ skills }) => {
  const getSkillIcon = (id: string) => {
    switch (id) {
      case 's-krtmi': return <Trophy className="w-6 h-6 text-amber-400" />;
      case 's-pcb': return <Cpu className="w-6 h-6 text-cyan-400" />;
      case 's-cv': return <Eye className="w-6 h-6 text-emerald-400" />;
      case 's-rektorat': return <ScrollText className="w-6 h-6 text-purple-400" />;
      case 's-thesis': return <GraduationCap className="w-6 h-6 text-blue-400" />;
      default: return <Dumbbell className="w-6 h-6 text-rose-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Legendary': return 'text-amber-400 border-amber-500/60 bg-amber-950/50';
      case 'Master': return 'text-purple-400 border-purple-500/60 bg-purple-950/50';
      case 'National': return 'text-cyan-400 border-cyan-500/60 bg-cyan-950/50';
      default: return 'text-slate-300 border-slate-600 bg-slate-900';
    }
  };

  return (
    <div className="system-card rounded-2xl p-5 md:p-7 text-cyan-50 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-cyan-800/60 pb-4 mb-5">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
          [HUNTER ARCHIVE & MASTERY]
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white glow-text-blue mt-1">
          SKILL TREE & REAL-WORLD ACHIEVEMENTS
        </h2>
        <p className="text-xs sm:text-sm text-cyan-300/80 mt-0.5">
          Bukti nyata kehebatan dan potensimu yang sudah terbukti di panggung nasional.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={`rounded-xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden ${
              skill.unlocked
                ? 'bg-slate-950/80 border-cyan-500/50 hover:border-cyan-400 shadow-md glow-blue-sm'
                : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-xl border shrink-0 ${
                  skill.unlocked ? 'bg-cyan-950/70 border-cyan-600/60' : 'bg-slate-900 border-slate-800'
                }`}>
                  {getSkillIcon(skill.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-md border font-bold ${getTierColor(skill.tier)}`}>
                      {skill.tier}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">[{skill.type}]</span>
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold mt-1 ${skill.unlocked ? 'text-white' : 'text-slate-400'}`}>
                    {skill.name}
                  </h3>
                </div>
              </div>

              <div className="shrink-0">
                {skill.unlocked ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-mono font-bold bg-emerald-950/70 border border-emerald-600/50 px-3 py-1.5 rounded-lg">
                    <Unlock className="w-4 h-4" /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1.5 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                    <Lock className="w-4 h-4" /> LOCKED
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-3.5 leading-relaxed">
              {skill.description}
            </p>

            <div className="mt-3.5 pt-3 border-t border-cyan-950/80 text-xs sm:text-sm font-mono">
              <span className="text-cyan-400 font-semibold">Persyaratan / Bukti Nyata: </span>
              <span className={skill.unlocked ? 'text-white font-medium' : 'text-slate-500'}>
                {skill.realWorldProof}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
