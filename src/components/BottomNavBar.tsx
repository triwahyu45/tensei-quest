import React from 'react';
import { Shield, CheckSquare, Calendar, Award, Bot } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'status' | 'quests' | 'schedule' | 'skills' | 'ai';
  onSelectTab: (tab: 'status' | 'quests' | 'schedule' | 'skills' | 'ai') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'status', label: 'Status', icon: Shield },
    { id: 'quests', label: 'Quest', icon: CheckSquare },
    { id: 'schedule', label: 'Jadwal', icon: Calendar },
    { id: 'skills', label: 'Skill', icon: Award },
    { id: 'ai', label: 'AI Chat', icon: Bot },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#040816]/95 backdrop-blur-lg border-t border-cyan-900/70 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-cyan-950 border border-cyan-500/60 shadow-lg glow-blue-sm scale-110'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              </div>
              <span className="text-[11px] font-mono tracking-wide mt-0.5">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-0.5 bg-cyan-400 rounded-full shadow glow-blue-sm"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
