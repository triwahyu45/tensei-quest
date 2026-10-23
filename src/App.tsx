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
import { BottomNavBar } from './components/BottomNavBar';
import { getCurrentSessionUser, logoutUser, deleteCurrentUserAccount } from './utils/auth';
import { saveToCloudDatabase } from './utils/cloudSync';
import { playSound } from './utils/audio';
import { Shield, CheckSquare, Calendar, Award, Download, Upload, RotateCcw, Share2, LogOut, Trash2, User, Bot, CloudCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'tensei_quest_v1';

export function App() {
  const [currentUsername, setCurrentUsername] = useState<string>(() => getCurrentSessionUser() || '');
  const [isAuthOpen, setIsAuthOpen] = useState(() => !getCurrentSessionUser());
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

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

  // Sync state to local storage and trigger cloud sync debounced
  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem(getUserKey('player'), JSON.stringify(player));
      localStorage.setItem(getUserKey('quests'), JSON.stringify(quests));
      localStorage.setItem(getUserKey('slots'), JSON.stringify(slots));
      localStorage.setItem(getUserKey('penalty'), JSON.stringify(penalty));

      // Auto Cloud Backup in background
      const timer = setTimeout(() => {
        saveToCloudDatabase(currentUsername, 'tensei_session_sync', { player, quests, slots, skills })
          .then(() => setIsCloudSynced(true))
          .catch(() => {});
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [player, quests, slots, penalty, currentUsername]);

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

    // Open Insta Story prompt
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
      <header className="border-b border-cyan-900/60 bg-[#060c1d]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-xl shadow glow-blue-sm">
              T
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wider text-white flex items-center gap-2">
                TENSEI QUEST <span className="text-cyan-400 font-mono text-xs font-bold">v1.3</span>
              </h1>
              <p className="text-xs text-cyan-300/80 font-mono flex items-center gap-1.5">
                Hunter: <strong className="text-white">{currentUsername || 'Belum Login'}</strong> &bull; Lv. {player.level}
                {isCloudSynced && (
                  <span className="text-emerald-400 inline-flex items-center gap-0.5 text-[10px]" title="Tersinkron ke Cloud Database">
                    <CloudCheck className="w-3 h-3" /> Sync
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-cyan-900/60 font-mono text-xs">
            <button
              onClick={() => setActiveTab('status')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition ${
                activeTab === 'status'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Shield className="w-4 h-4" /> Status
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition ${
                activeTab === 'quests'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" /> Daily Quest
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition ${
                activeTab === 'schedule'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Calendar className="w-4 h-4" /> Jadwal
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition ${
                activeTab === 'skills'
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Award className="w-4 h-4" /> Skill Tree
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'text-cyan-400 hover:text-cyan-200'
              }`}
            >
              <Bot className="w-4 h-4" /> System AI
            </button>
          </nav>

          {/* Quick Actions (Insta Story, Account Switch, Logout) */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setIsStoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition shadow min-h-[40px]"
            >
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Insta Story</span>
            </button>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-cyan-800/60 text-cyan-300 hover:text-white transition min-h-[40px]"
              title="Ganti Akun / Sync Multi-Device"
            >
              <User className="w-4 h-4" /> <span className="hidden sm:inline">Akun</span>
            </button>

            {currentUsername && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 transition min-h-[40px] flex items-center justify-center"
                title="Keluar (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (With bottom padding for Mobile Navigation) */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 md:p-8 flex-1 pb-24 md:pb-8">
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

      {/* Mobile Bottom Navigation Bar (Thumb-friendly on HP/Tablet) */}
      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

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

      {/* Bottom Utility Bar on Desktop */}
      <footer className="hidden md:block border-t border-cyan-950 bg-[#040713] px-4 py-3.5 text-xs text-slate-400 font-mono">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div>
            &copy; 2026 Tensei Quest (転生クエスト) &bull; Player: <strong className="text-cyan-400">{currentUsername || 'Tamu'}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition"
              title="Backup Data ke File JSON"
            >
              <Download className="w-4 h-4" /> Backup JSON
            </button>

            <label className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 cursor-pointer transition">
              <Upload className="w-4 h-4" /> Restore
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition"
              title="Reset ke Pengaturan Awal"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>

            {currentUsername && (
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition"
                title="Hapus Akun Ini Permanen"
              >
                <Trash2 className="w-4 h-4" /> Hapus Akun
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
