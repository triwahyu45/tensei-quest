import React, { useState } from 'react';
import { authenticateUser, registerNewUser } from '../utils/auth';
import type { HunterProfileSetup } from '../utils/auth';
import { generateHunterPackage } from '../utils/localAI';
import { saveToCloudDatabase, fetchFromCloudDatabase } from '../utils/cloudSync';
import { playSound } from '../utils/audio';
import { Lock, User, UserPlus, LogIn, Eye, EyeOff, ShieldCheck, AlertCircle, Compass, Target, Brain, Cloud } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (username: string) => void;
}

const MBTI_OPTIONS = [
  'ENFP', 'INFP', 'ENTJ', 'INTJ', 'ENTP', 'INTP', 'ENFJ', 'INFJ',
  'ESTP', 'ISTP', 'ESFP', 'ISFP', 'ESTJ', 'ISTJ', 'ESFJ', 'ISFJ'
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [username, setUsername] = useState('Triwahyu45');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Survey Fields
  const [fullName, setFullName] = useState('Tri Wahyu Handoyo');
  const [mbti, setMbti] = useState('ENFP');
  const [primaryWeakness, setPrimaryWeakness] = useState('Prokrastinasi Skripsi & Kurang Otot');
  const [targetGoal, setTargetGoal] = useState('Wisuda S1 & Bentuk Otot Calisthenics');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleNextStepOrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (!isRegister) {
        // 1. Special bypass/auto-setup for Triwahyu45
        if (username.trim().toLowerCase() === 'triwahyu45' && password === '@Triwahyu45') {
          const prefix = 'tensei_quest_v1_triwahyu45';
          const existing = localStorage.getItem(`${prefix}_player`);
          if (!existing) {
            const setup: HunterProfileSetup = {
              fullName: 'Tri Wahyu Handoyo',
              mbti: 'ENFP',
              primaryWeakness: 'Prokrastinasi Skripsi & Kurang Otot',
              targetGoal: 'Wisuda S1 & Bentuk Otot Calisthenics',
            };
            const pkg = generateHunterPackage(setup);
            const masterPlayer = {
              name: 'Tri Wahyu Handoyo',
              nim: '22518241023',
              rank: 'E',
              level: 1,
              title: 'The Awakened ENFP Vanguard',
              hp: 75,
              maxHp: 100,
              mp: 120,
              maxMp: 120,
              fatigue: 35,
              maxFatigue: 100,
              exp: 0,
              maxExp: 100,
              statPoints: 3,
              stats: { str: 8, agi: 7, vit: 9, int: 38, per: 15 },
            };
            localStorage.setItem(`${prefix}_player`, JSON.stringify(masterPlayer));
            localStorage.setItem(`${prefix}_quests`, JSON.stringify(pkg.customQuests));
            await registerNewUser(username, password, setup);
          }
          playSound.questComplete();
          setSuccessMsg('Selamat datang kembali, Hunter Tri Wahyu!');
          setTimeout(() => onSuccess('Triwahyu45'), 500);
          return;
        }

        // 2. Standard authentication
        let isValid = await authenticateUser(username, password);

        // 3. Fallback to Cloud Database
        if (!isValid) {
          const cloudRes = await fetchFromCloudDatabase(username, password);
          if (cloudRes.success && cloudRes.data) {
            const data = cloudRes.data as { player: unknown; quests: unknown; slots: unknown; skills?: unknown };
            const prefix = `tensei_quest_v1_${username.trim().toLowerCase()}`;

            localStorage.setItem(`${prefix}_player`, JSON.stringify(data.player));
            localStorage.setItem(`${prefix}_quests`, JSON.stringify(data.quests));
            if (data.slots) localStorage.setItem(`${prefix}_slots`, JSON.stringify(data.slots));
            if (data.skills) localStorage.setItem(`${prefix}_skills`, JSON.stringify(data.skills));

            await registerNewUser(username, password);
            isValid = true;
          }
        }

        if (isValid) {
          playSound.questComplete();
          setSuccessMsg('Login berhasil! Menghubungkan ke System...');
          setTimeout(() => {
            onSuccess(username.trim());
          }, 500);
        } else {
          playSound.penaltyAlarm();
          setErrorMsg('Username atau Password salah! Klik tab "Daftar" di atas jika ini akun baru.');
        }
        return;
      }

      // Register flow: Step 1 -> Step 2
      if (step === 1) {
        if (username.trim().length < 3) {
          setErrorMsg('Username minimal 3 karakter.');
          return;
        }
        if (password.length < 4) {
          setErrorMsg('Password minimal 4 karakter.');
          return;
        }
        setFullName(username.trim());
        setStep(2);
        return;
      }

      // Register Step 2: Finalize Onboarding & Generate AI Profile
      const setup: HunterProfileSetup = {
        fullName: fullName.trim() || username.trim(),
        mbti,
        primaryWeakness,
        targetGoal,
      };

      const res = await registerNewUser(username, password, setup);
      if (res.success) {
        playSound.levelUp();
        setSuccessMsg('Karakter Hunter berhasil dibangkitkan & disinkronkan!');

        const pkg = generateHunterPackage(setup);
        const prefix = `tensei_quest_v1_${username.trim().toLowerCase()}`;

        const generatedPlayer = {
          name: setup.fullName,
          nim: `HUNTER-${Math.floor(1000 + Math.random() * 9000)}`,
          rank: 'E',
          level: 1,
          title: pkg.title,
          hp: 75,
          maxHp: 100,
          mp: 100,
          maxMp: 100,
          fatigue: 35,
          maxFatigue: 100,
          exp: 0,
          maxExp: 100,
          statPoints: 3,
          stats: pkg.stats,
        };

        localStorage.setItem(`${prefix}_player`, JSON.stringify(generatedPlayer));
        localStorage.setItem(`${prefix}_quests`, JSON.stringify(pkg.customQuests));

        await saveToCloudDatabase(username, password, {
          player: generatedPlayer,
          quests: pkg.customQuests,
        });

        setTimeout(() => {
          onSuccess(username.trim());
        }, 700);
      } else {
        playSound.penaltyAlarm();
        setErrorMsg(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-md overflow-y-auto">
      {/* Big Responsive Card: scales generously on mobile */}
      <div className="system-card w-full max-w-md sm:max-w-lg rounded-2xl p-6 sm:p-8 text-cyan-50 shadow-2xl border-2 border-cyan-500/70 glow-blue my-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-950/90 border-2 border-cyan-400 text-cyan-400 mb-3 shadow-lg glow-blue-sm">
            {isRegister && step === 2 ? <Brain className="w-8 h-8 animate-pulse" /> : <Lock className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-white glow-text-blue">
            {isRegister && step === 2 ? 'AWAKENING ASSESSMENT' : 'SYSTEM ACCESS GATE'}
          </h2>
          <p className="text-sm sm:text-base text-cyan-300 font-mono mt-1.5 font-medium">
            {isRegister
              ? (step === 1 ? 'Langkah 1: Akun Pribadi Multi-Device' : 'Langkah 2: Penyesuaian MBTI & Quest AI')
              : 'Masuk & Sinkronkan Progres di Semua HP/Laptop'}
          </p>
        </div>

        {/* Mode Switcher */}
        {step === 1 && (
          <div className="flex rounded-xl bg-slate-950 p-1.5 mb-6 border border-cyan-900/80 font-mono text-sm sm:text-base">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 min-h-[48px] ${
                !isRegister ? 'bg-cyan-600 text-white shadow glow-blue-sm scale-[1.02]' : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <LogIn className="w-5 h-5" /> Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 min-h-[48px] ${
                isRegister ? 'bg-cyan-600 text-white shadow glow-blue-sm scale-[1.02]' : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <UserPlus className="w-5 h-5" /> Daftar (Register)
            </button>
          </div>
        )}

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-5 p-4 rounded-xl bg-red-950/90 border-2 border-red-700 text-red-100 text-sm sm:text-base flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-950/90 border-2 border-emerald-700 text-emerald-100 text-sm sm:text-base flex items-start gap-3 shadow-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-snug font-semibold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleNextStepOrSubmit} className="space-y-5 font-mono text-sm sm:text-base">
          {/* STEP 1: Username & Password */}
          {(!isRegister || step === 1) && (
            <>
              <div>
                <label className="block text-cyan-300 font-bold mb-2 uppercase tracking-wider text-sm sm:text-base">
                  Hunter Username
                </label>
                <div className="relative">
                  <User className="w-6 h-6 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: Triwahyu45"
                    className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3.5 pl-13 pr-4 text-white text-base sm:text-lg focus:outline-none focus:border-cyan-400 transition min-h-[52px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-2 uppercase tracking-wider text-sm sm:text-base">
                  Secret Password
                </label>
                <div className="relative">
                  <Lock className="w-6 h-6 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password rahasia"
                    className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3.5 pl-13 pr-13 text-white text-base sm:text-lg focus:outline-none focus:border-cyan-400 transition min-h-[52px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-cyan-300 p-1.5"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Onboarding Survey */}
          {isRegister && step === 2 && (
            <>
              <div>
                <label className="block text-cyan-300 font-bold mb-1.5 uppercase tracking-wider text-sm sm:text-base">
                  Nama Lengkap Hunter
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Tri Wahyu Handoyo"
                  className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3 px-4 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[50px]"
                />
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base">
                  <Compass className="w-5 h-5 text-cyan-400" /> Tipe Kepribadian (MBTI)
                </label>
                <select
                  value={mbti}
                  onChange={(e) => setMbti(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3 px-4 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[50px]"
                >
                  {MBTI_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item} {item === 'ENFP' ? '(Inovator / Visioner)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base">
                  <AlertCircle className="w-5 h-5 text-amber-400" /> Kelemahan Terbesarmu
                </label>
                <input
                  type="text"
                  required
                  value={primaryWeakness}
                  onChange={(e) => setPrimaryWeakness(e.target.value)}
                  placeholder="Contoh: Prokrastinasi Skripsi & Kurang Otot"
                  className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3 px-4 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[50px]"
                />
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base">
                  <Target className="w-5 h-5 text-emerald-400" /> Target Utama yang Ingin Dicapai
                </label>
                <input
                  type="text"
                  required
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="Contoh: Wisuda S1 & Bentuk Otot Calisthenics"
                  className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3 px-4 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[50px]"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-3">
            {isRegister && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-6 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-base font-bold min-h-[52px]"
              >
                Kembali
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 rounded-xl font-black text-base sm:text-lg tracking-wider uppercase bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl glow-blue transition min-h-[54px] flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoading && <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {isRegister
                ? (step === 1 ? 'Lanjut ke Tes Kepribadian →' : 'Bangkitkan Karakter (Generate AI)')
                : 'Buka Kunci Sistem & Sync'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs sm:text-sm text-slate-300 border-t border-cyan-950/80 pt-4 flex items-center justify-center gap-2">
          <Cloud className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>Cross-Device Cloud Sync Aktif: Kamu bisa login di HP/tablet mana saja dan akunmu otomatis sinkron!</span>
        </div>
      </div>
    </div>
  );
};
