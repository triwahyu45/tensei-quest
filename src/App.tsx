import { useState, useEffect } from 'react';
import type { PlayerProfile, DailyQuest, TimetableSlot, SkillItem, PenaltyZoneState, PlayerStats } from './types';
import { initialPlayer, initialQuests, initialTimetable, initialSkills, defaultPenaltyState } from './utils/defaultData';
import { StatusWindow } from './components/StatusWindow';
import { DailyQuests } from './components/DailyQuests';
import { TimetableSchedule } from './components/TimetableSchedule';
import { SkillTree } from './components/SkillTree';
import { PenaltyZoneModal } from './components/PenaltyZoneModal';
import { AuthModal } from './components/AuthModal';
import { InstaStoryModal } from './components/InstaStoryModal';
import { SystemChatbot } from './components/SystemChatbot';
import { getCurrentSessionUser, logoutUser, deleteCurrentUserAccount } from './utils/auth';
import { playSound } from './utils/audio';
import { Shield, CheckSquare, Calendar, Award, Download, Upload, RotateCcw, Share2, LogOut, Trash2, User, Bot } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'tensei_quest_v1';

export function App() {
  const [currentUsername, setCurrentUsername] = useState<string>(() => getCurrentSessionUser() || '');
  const [isAuthOpen, setIsAuthOpen] = useState(() => !getCurrentSessionUser());
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Dynamic user data keys based on active account
  const getUserKey = (type: string) => `${STORAGE_KEY}_${(currentUsername || 'guest').toLowerCase()}_${type}`;

  const [player, setPlayer] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem(getUserKey('player'));
    if (saved) return JSON.parse(saved);
    return {
      ...initialPlayer,
      name: currentUsername || 'Player Baru',
      nim: `HUNTER-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    const saved = localStorage.getItem(getUserKey('quests'));
    return saved ? JSON.parse(saved) : initialQuests;
  });

  const [slots, setSlots] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(getUserKey('slots'));
    return saved ? JSON.parse(saved) : initialTimetable;
  });

  const [skills] = useState<SkillItem[]>(() => {
    const saved = localStorage.getItem(getUserKey('skills'));
    return saved ? JSON.parse(saved) : initialSkills;
  });

  const [penalty, setPenalty] = useState<PenaltyZoneState>(() => {
    const saved = localStorage.getItem(getUserKey('penalty'));
    return saved ? JSON.parse(saved) : defaultPenaltyState;
  });

  const [activeTab, setActiveTab] = useState<'status' | 'quests' | 'schedule' | 'skills' | 'ai'>('status');

  // Reload data when active user changes
  useEffect(() => {
    if (!currentUsername) {
      setIsAuthOpen(true);
      return;
    }

    const savedPlayer = localStorage.getItem(getUserKey('player'));
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer));
    } else {
      setPlayer({
        ...initialPlayer,
        name: currentUsername,
        nim: `HUNTER-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }

    const savedQuests = localStorage.getItem(getUserKey('quests'));
    setQuests(savedQuests ? JSON.parse(savedQuests) : initialQuests);

    const savedSlots = localStorage.getItem(getUserKey('slots'));
    setSlots(savedSlots ? JSON.parse(savedSlots) : initialTimetable);

    const savedPenalty = localStorage.getItem(getUserKey('penalty'));
    setPenalty(savedPenalty ? JSON.parse(savedPenalty) : defaultPenaltyState);
  }, [currentUsername]);

  // Sync state to current user's isolated storage
  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem(getUserKey('player'), JSON.stringify(player));
    }
  }, [player, currentUsername]);

  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem(getUserKey('quests'), JSON.stringify(quests));
    }
  }, [quests, currentUsername]);

  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem(getUserKey('slots'), JSON.stringify(slots));
    }
  }, [slots, currentUsername]);

  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem(getUserKey('penalty'), JSON.stringify(penalty));
    }
  }, [penalty, currentUsername]);

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

    while (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = Math.round(newMaxExp * 1.25);
      newStatPoints += 3;
    }

    let newRank = player.rank;
    let newTitle = player.title;
    if (newLevel >= 20) { newRank = 'S'; newTitle = 'Shadow Monarch of Awakening'; }
    else if (newLevel >= 15) { newRank = 'A'; newTitle = 'High-Rank Architect'; }
    else if (newLevel >= 10) { newRank = 'B'; newTitle = 'Vanguard Hunter'; }
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
      fatigue: Math.max(0, prev.fatigue - 25),
    }));

    setQuests((prev) => prev.map((q) => ({ ...q, completed: false })));

    // Open Insta Story congratulation prompt
    setTimeout(() => {
      setIsStoryOpen(true);
    }, 800);
  };

  const handleToggleSlot = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, completed: !s.completed } : s))
    );
  };

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
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    setPenalty((prev) => ({ ...prev, isActive: false }));
  };

  // Logout Handler
  const handleLogout = () => {
    logoutUser();
    setCurrentUsername('');
    setIsAuthOpen(true);
  };

  // Delete Account Handler
  const handleDeleteAccount = () => {
    if (!currentUsername) return;
    if (confirm(`PERINGATAN: Hapus akun [${currentUsername}] dan seluruh datanya secara permanen?`)) {
      deleteCurrentUserAccount();
      alert('Akun telah dihapus.');
      setCurrentUsername('');
      setIsAuthOpen(true);
    }
  };

  // Auth Success
  const handleAuthSuccess = (newUsername: string) => {
    setCurrentUsername(newUsername);
    setIsAuthOpen(false);
  };

  // Export JSON
  const handleExportData = () => {
    const backup = { player, quests, slots, skills, penalty, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tensei_Quest_${currentUsername || 'Hunter'}_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // Import JSON
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
        alert('Data berhasil dipulihkan!');
      } catch {
        alert('Format file JSON tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  // Reset to Initial
  const handleReset = () => {
    if (confirm('Yakin ingin mereset data akun ini ke kondisi awal?')) {
      setPlayer({
        ...initialPlayer,
        name: currentUsername || 'Player',
      });
      setQuests(initialQuests);
      setSlots(initialTimetable);
      setPenalty(defaultPenaltyState);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Futuristic Navigation Bar */}
      <header className="border-b border-cyan-900/50 bg-[#060c1d]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-lg shadow glow-blue-sm">
                T
              </div>
              <div>
                <h1 className="text-base font-black tracking-wider text-white flex items-center gap-2">
                  TENSEI QUEST <span className="text-cyan-400 font-mono text-xs font-normal">v1.2</span>
                </h1>
                <p className="text-[10px] text-cyan-300/70 font-mono">
                  Hunter: <strong className="text-white">{currentUsername || 'Belum Login'}</strong> &bull; Level {player.level}
                </p>
              </div>
            </div>

            {/* Quick Share to Insta Story Icon on Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsStoryOpen(true)}
                className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                title="Share Insta Story"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-cyan-900/60 font-mono text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('status')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === 'status'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Status
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === 'quests'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" /> Daily Quest
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Jadwal
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === 'skills'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Skill Tree
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'text-cyan-400 hover:text-cyan-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> System AI
            </button>
          </nav>

          {/* Account Actions */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setIsStoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition shadow"
            >
              <Share2 className="w-3.5 h-3.5" /> Insta Story
            </button>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-900/60 text-cyan-300 hover:text-white transition"
              title="Ganti Akun / Daftar"
            >
              <User className="w-3.5 h-3.5" /> Akun
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 transition"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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

        {activeTab === 'ai' && (
          <SystemChatbot player={player} />
        )}
      </main>

      {/* Modals */}
      <PenaltyZoneModal
        penalty={penalty}
        onTogglePenaltyTask={handleTogglePenaltyTask}
        onClearPenalty={handleClearPenalty}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onSuccess={handleAuthSuccess}
      />

      <InstaStoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        player={player}
        quests={quests}
      />

      {/* Bottom Utility Bar */}
      <footer className="border-t border-cyan-950 bg-[#040713] px-4 py-3 text-xs text-slate-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; 2026 Tensei Quest (転生クエスト) &bull; Player: <strong className="text-cyan-400">{currentUsername || 'Tamu'}</strong>
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
              className="flex items-center gap-1 text-amber-400/80 hover:text-amber-300 transition"
              title="Reset ke Pengaturan Awal"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            {currentUsername && (
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-1 text-red-500/80 hover:text-red-400 transition"
                title="Hapus Akun Ini Permanen"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Akun
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
