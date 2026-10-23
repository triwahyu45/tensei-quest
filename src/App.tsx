import { useState, useEffect } from 'react';
import type { PlayerProfile, DailyQuest, TimetableSlot, SkillItem, PenaltyZoneState, PlayerStats } from './types';
import { initialPlayer, initialQuests, initialTimetable, initialSkills, defaultPenaltyState } from './utils/defaultData';
import { StatusWindow } from './components/StatusWindow';
import { DailyQuests } from './components/DailyQuests';
import { TimetableSchedule } from './components/TimetableSchedule';
import { SkillTree } from './components/SkillTree';
import { PenaltyZoneModal } from './components/PenaltyZoneModal';
import { playSound } from './utils/audio';
import { Shield, CheckSquare, Calendar, Award, Download, Upload, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'tri_wahyu_solo_leveling_v1';

export function App() {
  // Load State from LocalStorage or Default
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_player`);
    return saved ? JSON.parse(saved) : initialPlayer;
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quests`);
    return saved ? JSON.parse(saved) : initialQuests;
  });

  const [slots, setSlots] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_slots`);
    return saved ? JSON.parse(saved) : initialTimetable;
  });

  const [skills] = useState<SkillItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_skills`);
    return saved ? JSON.parse(saved) : initialSkills;
  });

  const [penalty, setPenalty] = useState<PenaltyZoneState>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_penalty`);
    return saved ? JSON.parse(saved) : defaultPenaltyState;
  });

  const [activeTab, setActiveTab] = useState<'status' | 'quests' | 'schedule' | 'skills'>('status');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_player`, JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quests`, JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_slots`, JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_penalty`, JSON.stringify(penalty));
  }, [penalty]);

  // Upgrade Player Stat
  const handleUpgradeStat = (statKey: keyof PlayerStats) => {
    if (player.statPoints <= 0) return;
    setPlayer((prev) => ({
      ...prev,
      statPoints: prev.statPoints - 1,
      stats: {
        ...prev.stats,
        [statKey]: prev.stats[statKey] + 1,
      },
    }));
  };

  // Toggle Daily Quest
  const handleToggleQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: !q.completed } : q))
    );
  };

  // Claim All Quests (XP, Level Up, Rewards)
  const handleClaimAllRewards = () => {
    const earnedXp = quests.reduce((sum, q) => sum + (q.completed ? q.xpReward : 0), 0);
    let newExp = player.exp + earnedXp;
    let newLevel = player.level;
    let newMaxExp = player.maxExp;
    let newStatPoints = player.statPoints;

    // Check level up
    while (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = Math.round(newMaxExp * 1.25);
      newStatPoints += 3; // +3 stat points per level!
    }

    // Rank promotions
    let newRank = player.rank;
    let newTitle = player.title;
    if (newLevel >= 20) { newRank = 'S'; newTitle = 'Shadow Monarch of Mechatronics'; }
    else if (newLevel >= 15) { newRank = 'A'; newTitle = 'High-Rank Mechatronics Architect'; }
    else if (newLevel >= 10) { newRank = 'B'; newTitle = 'Vanguard Engineer'; }
    else if (newLevel >= 5) { newRank = 'C'; newTitle = 'The Awakening Fighter'; }
    else if (newLevel >= 2) { newRank = 'D'; newTitle = 'Disciplined Hunter'; }

    setPlayer((prev) => ({
      ...prev,
      level: newLevel,
      rank: newRank,
      title: newTitle,
      exp: newExp,
      maxExp: newMaxExp,
      statPoints: newStatPoints,
      hp: Math.min(prev.maxHp, prev.hp + 20),
      fatigue: Math.max(0, prev.fatigue - 25), // Recovery!
    }));

    // Reset quests for tomorrow
    setQuests((prev) => prev.map((q) => ({ ...q, completed: false })));
  };

  // Toggle Schedule Slot
  const handleToggleSlot = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, completed: !s.completed } : s))
    );
  };

  // Penalty Zone Trigger / Simulation
  const handleTriggerPenaltyTest = () => {
    playSound.penaltyAlarm();
    setPenalty({
      isActive: true,
      reason: 'Peringatan: Kamu terdeteksi menunda-nunda tanggung jawab dan membiarkan kemalasan menang.',
      tasks: defaultPenaltyState.tasks.map((t) => ({ ...t, completed: false })),
    });
  };

  const handleTogglePenaltyTask = (taskId: string) => {
    setPenalty((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const handleClearPenalty = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
    setPenalty((prev) => ({
      ...prev,
      isActive: false,
    }));
  };

  // Export / Backup State to JSON
  const handleExportData = () => {
    const backup = { player, quests, slots, skills, penalty, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tri_Wahyu_Solo_Leveling_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // Import State from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.player) setPlayer(parsed.player);
        if (parsed.quests) setQuests(parsed.quests);
        if (parsed.slots) setSlots(parsed.slots);
        alert('Data Solo Leveling berhasil dipulihkan!');
      } catch {
        alert('Format file JSON tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  // Reset to Initial
  const handleReset = () => {
    if (confirm('Yakin ingin mereset seluruh data kembali ke awal?')) {
      setPlayer(initialPlayer);
      setQuests(initialQuests);
      setSlots(initialTimetable);
      setPenalty(defaultPenaltyState);
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Futuristic Navigation Bar */}
      <header className="border-b border-cyan-900/50 bg-[#060c1d]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-lg shadow glow-blue-sm">
              S
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider text-white flex items-center gap-2">
                SOLO LEVELING <span className="text-cyan-400 font-mono text-xs font-normal">v1.0</span>
              </h1>
              <p className="text-[10px] text-cyan-300/70 font-mono">
                The Personal Awakening System &bull; Tri Wahyu Handoyo
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-cyan-900/60 font-mono text-xs">
            <button
              onClick={() => setActiveTab('status')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'status'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Status
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'quests'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" /> Daily Quest
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'schedule'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Jadwal Kuliah
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'skills'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Skill Tree
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full p-4 md:p-6 flex-1">
        {activeTab === 'status' && (
          <div className="space-y-6">
            <StatusWindow player={player} onUpgradeStat={handleUpgradeStat} />
            <DailyQuests
              quests={quests}
              onToggleQuest={handleToggleQuest}
              onClaimAllRewards={handleClaimAllRewards}
              onTriggerPenaltyTest={handleTriggerPenaltyTest}
            />
          </div>
        )}

        {activeTab === 'quests' && (
          <DailyQuests
            quests={quests}
            onToggleQuest={handleToggleQuest}
            onClaimAllRewards={handleClaimAllRewards}
            onTriggerPenaltyTest={handleTriggerPenaltyTest}
          />
        )}

        {activeTab === 'schedule' && (
          <TimetableSchedule slots={slots} onToggleSlot={handleToggleSlot} />
        )}

        {activeTab === 'skills' && (
          <SkillTree skills={skills} />
        )}
      </main>

      {/* Penalty Modal */}
      <PenaltyZoneModal
        penalty={penalty}
        onTogglePenaltyTask={handleTogglePenaltyTask}
        onClearPenalty={handleClearPenalty}
      />

      {/* Bottom Utility Bar (Backup, Restore, Reset) */}
      <footer className="border-t border-cyan-950 bg-[#040713] px-4 py-3 text-xs text-slate-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; 2026 Tri Wahyu Handoyo (NIM 22518241023) &bull; S1 Pendidikan Teknik Mekatronika UNY
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition"
              title="Backup Data ke File JSON"
            >
              <Download className="w-3.5 h-3.5" /> Backup JSON
            </button>

            <label className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" /> Restore
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-red-400/80 hover:text-red-300 transition"
              title="Reset ke Pengaturan Awal"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
