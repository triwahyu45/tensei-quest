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
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Credentials, Step 2: Onboarding Survey

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Survey Fields
  const [fullName, setFullName] = useState('');
  const [mbti, setMbti] = useState('ENFP');
  const [primaryWeakness, setPrimaryWeakness] = useState('Prokrastinasi & Kurang Gerak Fisik');
  const [targetGoal, setTargetGoal] = useState('Wisuda S1 & Membangun Otot Atletis');

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
        // 1. Try local authentication first
        let isValid = await authenticateUser(username, password);

        // 2. If not found locally, try Cloud Database Sync (e.g. logging in on a new phone/tablet)
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
          setErrorMsg('Username atau Password Hunter salah! (Jika belum punya akun, klik Daftar)');
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
        setSuccessMsg('Karakter Hunter berhasil dibangkitkan & disinkronkan ke Cloud Database!');

        // Generate profile
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

        // Sync encrypted vault to Cloud Database
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="system-card w-full max-w-lg rounded-2xl p-6 md:p-8 text-cyan-50 shadow-2xl border border-cyan-500/60 glow-blue my-auto">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950/90 border border-cyan-400 text-cyan-400 mb-2.5 shadow glow-blue-sm">
            {isRegister && step === 2 ? <Brain className="w-7 h-7 animate-pulse" /> : <Lock className="w-7 h-7" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-white glow-text-blue">
            {isRegister && step === 2 ? 'AWAKENING ASSESSMENT' : 'SYSTEM ACCESS GATE'}
          </h2>
          <p className="text-xs sm:text-sm text-cyan-300/80 font-mono mt-1">
            {isRegister
              ? (step === 1 ? 'Langkah 1: Akun Pribadi Multi-Device' : 'Langkah 2: Penyesuaian MBTI & Quest AI')
              : 'Masuk & Sinkronkan Progres di Semua Perangkat'}
          </p>
        </div>

        {/* Mode Switcher (Only on Step 1) */}
        {step === 1 && (
          <div className="flex rounded-xl bg-slate-950 p-1.5 mb-5 border border-cyan-900/60 font-mono text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
                !isRegister ? 'bg-cyan-600 text-white shadow glow-blue-sm' : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <LogIn className="w-4 h-4" /> Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); setUsername(''); setPassword(''); }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
                isRegister ? 'bg-cyan-600 text-white shadow glow-blue-sm' : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Daftar (Register)
            </button>
          </div>
        )}

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleNextStepOrSubmit} className="space-y-4 font-mono text-xs sm:text-sm">
          {/* STEP 1: Username & Password */}
          {(!isRegister || step === 1) && (
            <>
              <div>
                <label className="block text-cyan-400 font-bold mb-1.5 uppercase tracking-wider">
                  Hunter Username
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username unik"
                    className="w-full bg-slate-950/90 border border-cyan-900 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-400 transition min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan-400 font-bold mb-1.5 uppercase tracking-wider">
                  Secret Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password rahasia"
                    className="w-full bg-slate-950/90 border border-cyan-900 rounded-xl py-3 pl-11 pr-11 text-white focus:outline-none focus:border-cyan-400 transition min-h-[48px]"
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

          {/* STEP 2: Onboarding Questionnaire (Local AI Adaptation) */}
          {isRegister && step === 2 && (
            <>
              <div>
                <label className="block text-cyan-400 font-bold mb-1 uppercase tracking-wider">
                  Nama Lengkap / Panggilan Hunter
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Tri Wahyu Handoyo"
                  className="w-full bg-slate-950/90 border border-cyan-900 rounded-xl py-3 px-3.5 text-white focus:outline-none focus:border-cyan-400 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-cyan-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4" /> Tipe Kepribadian (MBTI)
                </label>
                <select
                  value={mbti}
                  onChange={(e) => setMbti(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-900 rounded-xl py-3 px-3.5 text-white focus:outline-none focus:border-cyan-400 min-h-[48px]"
                >
                  {MBTI_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item} {item === 'ENFP' ? '(Inovator / Visioner)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cyan-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" /> Kelemahan yang Ingin Dihancurkan
                </label>
                <input
                  type="text"
                  required
                  value={primaryWeakness}
                  onChange={(e) => setPrimaryWeakness(e.target.value)}
                  placeholder="Contoh: Prokrastinasi, Kurang Otot, Overthinking"
                  className="w-full bg-slate-950/90 border border-cyan-900 rounded-xl py-3 px-3.5 text-white focus:outline-none focus:border-cyan-400 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-cyan-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" /> Target Utama yang Ingin Dicapai
                </label>
                <input
                  type="text"
                  required
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="Contoh: Wisuda S1, Bentuk Otot Dada & Paha, Disiplin"
                  className="w-full bg-slate-950/90 border border-cyan-900 rounded-xl py-3 px-3.5 text-white focus:outline-none focus:border-cyan-400 min-h-[48px]"
                />
              </div>
            </>
          )}

          <div className="flex gap-2.5 pt-3">
            {isRegister && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white min-h-[48px]"
              >
                Kembali
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm sm:text-base tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg glow-blue transition min-h-[48px] flex items-center justify-center gap-2"
            >
              {isLoading && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {isRegister
                ? (step === 1 ? 'Lanjut ke Tes Kepribadian →' : 'Bangkitkan Karakter (Generate AI)')
                : 'Buka Kunci Sistem & Sync'}
            </button>
          </div>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400 border-t border-cyan-950/80 pt-3.5 flex items-center justify-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Cross-Device Cloud Sync Aktif: Kamu bisa login di HP/tablet mana saja dan akunmu otomatis sinkron!</span>
        </div>
      </div>
    </div>
  );
};
