import React, { useState } from 'react';
import { authenticateUser, registerNewUser } from '../utils/auth';
import type { HunterProfileSetup } from '../utils/auth';
import { generateHunterPackage } from '../utils/localAI';
import { saveToCloudDatabase, fetchFromCloudDatabase } from '../utils/cloudSync';
import { playSound } from '../utils/audio';
import { Lock, User, UserPlus, LogIn, Eye, EyeOff, ShieldCheck, Compass, Target, Brain, Cloud } from 'lucide-react';

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

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    try {
      // 1. Direct Recognition for Triwahyu45 (Case-insensitive)
      if (cleanUser.toLowerCase() === 'triwahyu45' && (cleanPass === '@Triwahyu45' || cleanPass === '@triwahyu45')) {
        const prefix = 'tensei_quest_v2_triwahyu45';
        const existing = localStorage.getItem(`${prefix}_player`);
        if (!existing) {
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
        }

        await registerNewUser('Triwahyu45', '@Triwahyu45');
        playSound.questComplete();
        setSuccessMsg('Karakter Tri Wahyu Handoyo Berhasil Diaktifkan!');
        setTimeout(() => onSuccess('Triwahyu45'), 500);
        return;
      }

      // 2. Standard Login
      if (!isRegister) {
        let isValid = await authenticateUser(cleanUser, cleanPass);

        if (!isValid) {
          const cloudRes = await fetchFromCloudDatabase(cleanUser, cleanPass);
          if (cloudRes.success && cloudRes.data) {
            const data = cloudRes.data as { player: unknown; quests: unknown; slots: unknown; skills?: unknown };
            const prefix = `tensei_quest_v2_${cleanUser.toLowerCase()}`;

            localStorage.setItem(`${prefix}_player`, JSON.stringify(data.player));
            localStorage.setItem(`${prefix}_quests`, JSON.stringify(data.quests));
            if (data.slots) localStorage.setItem(`${prefix}_slots`, JSON.stringify(data.slots));
            if (data.skills) localStorage.setItem(`${prefix}_skills`, JSON.stringify(data.skills));

            await registerNewUser(cleanUser, cleanPass);
            isValid = true;
          }
        }

        // Auto-Register Fallback: If account not found, activate it automatically!
        if (!isValid) {
          if (cleanPass.length >= 4) {
            setSuccessMsg(`Akun [${cleanUser}] baru pertama kali masuk. Mengaktifkan secara otomatis...`);
            const setup: HunterProfileSetup = {
              fullName: cleanUser,
              mbti: 'ENFP',
              primaryWeakness: 'Prokrastinasi & Kurang Gerak Fisik',
              targetGoal: 'Disiplin Konsisten & Level Up',
            };
            const pkg = generateHunterPackage(setup);
            const prefix = `tensei_quest_v2_${cleanUser.toLowerCase()}`;
            const newPlayer = {
              name: cleanUser,
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

            localStorage.setItem(`${prefix}_player`, JSON.stringify(newPlayer));
            localStorage.setItem(`${prefix}_quests`, JSON.stringify(pkg.customQuests));
            await registerNewUser(cleanUser, cleanPass, setup);

            playSound.levelUp();
            setTimeout(() => onSuccess(cleanUser), 700);
            return;
          } else {
            playSound.penaltyAlarm();
            setErrorMsg('Password minimal 4 karakter!');
            return;
          }
        }

        playSound.questComplete();
        setSuccessMsg('Login berhasil! Membuka gerbang Tensei...');
        setTimeout(() => onSuccess(cleanUser), 500);
        return;
      }

      // 3. Register Flow
      if (step === 1) {
        if (cleanUser.length < 3) {
          setErrorMsg('Username minimal 3 karakter.');
          return;
        }
        if (cleanPass.length < 4) {
          setErrorMsg('Password minimal 4 karakter.');
          return;
        }
        setFullName(cleanUser);
        setStep(2);
        return;
      }

      const setup: HunterProfileSetup = {
        fullName: fullName.trim() || cleanUser,
        mbti,
        primaryWeakness,
        targetGoal,
      };

      await registerNewUser(cleanUser, cleanPass, setup);
      playSound.levelUp();
      setSuccessMsg('Karakter Hunter berhasil dibangkitkan!');

      const pkg = generateHunterPackage(setup);
      const prefix = `tensei_quest_v2_${cleanUser.toLowerCase()}`;

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

      await saveToCloudDatabase(cleanUser, cleanPass, {
        player: generatedPlayer,
        quests: pkg.customQuests,
      });

      setTimeout(() => onSuccess(cleanUser), 700);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-md overflow-y-auto">
      {/* Full-width responsive container on mobile */}
      <div className="system-card w-[94vw] max-w-md sm:max-w-lg rounded-2xl p-6 sm:p-8 text-cyan-50 shadow-2xl border-2 border-cyan-400 glow-blue my-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-400 text-cyan-400 mb-3 shadow-lg glow-blue-sm">
            {isRegister && step === 2 ? <Brain className="w-8 h-8 animate-pulse" /> : <Lock className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-white glow-text-blue">
            {isRegister && step === 2 ? 'AWAKENING ASSESSMENT' : 'SYSTEM ACCESS GATE'}
          </h2>
          <p className="text-sm sm:text-base text-cyan-300 font-mono mt-1 font-semibold">
            {isRegister
              ? (step === 1 ? 'Pendaftaran Akun Multi-Device' : 'Penyesuaian Karakter & Quest AI')
              : 'Masuk & Sinkronkan Akun di Semua HP/Laptop'}
          </p>
        </div>

        {/* Mode Switcher */}
        {step === 1 && (
          <div className="flex rounded-xl bg-slate-950 p-1.5 mb-5 border border-cyan-800 font-mono text-sm sm:text-base">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 min-h-[46px] ${
                !isRegister ? 'bg-cyan-600 text-white shadow glow-blue-sm' : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <LogIn className="w-5 h-5" /> Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 min-h-[46px] ${
                isRegister ? 'bg-cyan-600 text-white shadow glow-blue-sm' : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <UserPlus className="w-5 h-5" /> Daftar (Register)
            </button>
          </div>
        )}

        {/* Feedback Alert Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950 border-2 border-red-600 text-red-100 text-sm font-semibold shadow-md">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950 border-2 border-emerald-500 text-emerald-100 text-sm font-semibold shadow-md flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleNextStepOrSubmit} className="space-y-4 font-mono text-sm sm:text-base">
          {(!isRegister || step === 1) && (
            <>
              <div>
                <label className="block text-cyan-300 font-bold mb-1.5 uppercase tracking-wider text-xs sm:text-sm">
                  Hunter Username
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: Triwahyu45"
                    className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3.5 pl-11 pr-4 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[52px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1.5 uppercase tracking-wider text-xs sm:text-sm">
                  Secret Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan passwordmu"
                    className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3.5 pl-11 pr-11 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[52px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-cyan-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {isRegister && step === 2 && (
            <>
              <div>
                <label className="block text-cyan-300 font-bold mb-1 text-xs sm:text-sm uppercase tracking-wider">
                  Nama Lengkap Hunter
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3 px-3.5 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[50px]"
                />
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-cyan-400" /> Tipe Kepribadian (MBTI)
                </label>
                <select
                  value={mbti}
                  onChange={(e) => setMbti(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3 px-3.5 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[50px]"
                >
                  {MBTI_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item} {item === 'ENFP' ? '(Inovator / Visioner)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1 text-xs sm:text-sm uppercase tracking-wider">
                  Kelemahan yang Ingin Dihancurkan
                </label>
                <input
                  type="text"
                  required
                  value={primaryWeakness}
                  onChange={(e) => setPrimaryWeakness(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3 px-3.5 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[50px]"
                />
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" /> Target Impian Utama
                </label>
                <input
                  type="text"
                  required
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-cyan-900 rounded-xl py-3 px-3.5 text-white text-base focus:outline-none focus:border-cyan-400 min-h-[50px]"
                />
              </div>
            </>
          )}

          <div className="flex gap-2.5 pt-2">
            {isRegister && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-sm font-bold min-h-[50px]"
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

        <div className="mt-5 text-center text-xs text-slate-300 border-t border-cyan-950/80 pt-3.5 flex items-center justify-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Cross-Device Sync Aktif &bull; Buka di HP, Tablet, & Laptop</span>
        </div>
      </div>
    </div>
  );
};
