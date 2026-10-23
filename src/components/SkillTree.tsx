import React from 'react';
import type { SkillItem } from '../types';
import { Lock, Unlock, Trophy, Cpu, Eye, ScrollText, GraduationCap, Dumbbell } from 'lucide-react';

interface SkillTreeProps {
  skills: SkillItem[];
}

export const SkillTree: React.FC<SkillTreeProps> = ({ skills }) => {
  const getSkillIcon = (id: string) => {
    switch (id) {
      case 's-krtmi': return <Trophy className="w-5 h-5 text-amber-400" />;
      case 's-pcb': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 's-cv': return <Eye className="w-5 h-5 text-emerald-400" />;
      case 's-rektorat': return <ScrollText className="w-5 h-5 text-purple-400" />;
      case 's-thesis': return <GraduationCap className="w-5 h-5 text-blue-400" />;
      default: return <Dumbbell className="w-5 h-5 text-rose-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Legendary': return 'text-amber-400 border-amber-500/50 bg-amber-950/40';
      case 'Master': return 'text-purple-400 border-purple-500/50 bg-purple-950/40';
      case 'National': return 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40';
      default: return 'text-slate-400 border-slate-600 bg-slate-900';
    }
  };

  return (
    <div className="system-card rounded-xl p-5 md:p-6 text-cyan-50 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-cyan-800/60 pb-4 mb-4">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">Hunter Archive & Mastery</span>
        <h2 className="text-xl md:text-2xl font-black text-white glow-text-blue mt-1">
          SKILL TREE & REAL-WORLD ACHIEVEMENTS
        </h2>
        <p className="text-xs text-cyan-300/80">
          Bukti nyata kehebatan dan potensi dirimu yang sudah terbukti di dunia nyata.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={`rounded-xl p-4 border transition-all duration-300 relative overflow-hidden ${
              skill.unlocked
                ? 'bg-slate-950/80 border-cyan-500/50 hover:border-cyan-400 shadow-md glow-blue-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg border ${
                  skill.unlocked ? 'bg-cyan-950/60 border-cyan-600/50' : 'bg-slate-900 border-slate-800'
                }`}>
                  {getSkillIcon(skill.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${getTierColor(skill.tier)}`}>
                      {skill.tier}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">[{skill.type}]</span>
                  </div>
                  <h3 className={`text-base font-bold mt-1 ${skill.unlocked ? 'text-white' : 'text-slate-400'}`}>
                    {skill.name}
                  </h3>
                </div>
              </div>

              <div>
                {skill.unlocked ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-mono font-bold bg-emerald-950/60 border border-emerald-600/40 px-2 py-1 rounded">
                    <Unlock className="w-3.5 h-3.5" /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1 text-xs font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    <Lock className="w-3.5 h-3.5" /> LOCKED
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {skill.description}
            </p>

            <div className="mt-3 pt-2.5 border-t border-cyan-950/60 text-xs font-mono">
              <span className="text-cyan-400 font-semibold">Persyaratan / Bukti Nyata: </span>
              <span className={skill.unlocked ? 'text-cyan-200' : 'text-slate-500'}>
                {skill.realWorldProof}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
