import React, { useState } from 'react';
import { authenticateUser, registerNewUser } from '../utils/auth';
import type { HunterProfileSetup } from '../utils/auth';
import { generateHunterPackage } from '../utils/localAI';
import { playSound } from '../utils/audio';
import { Lock, User, UserPlus, LogIn, Eye, EyeOff, ShieldCheck, AlertCircle, Compass, Target, Brain } from 'lucide-react';

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

    if (!isRegister) {
      // Login flow
      const isValid = await authenticateUser(username, password);
      if (isValid) {
        playSound.questComplete();
        onSuccess(username.trim());
      } else {
        playSound.penaltyAlarm();
        setErrorMsg('Username atau Password Hunter salah! (Jika belum punya, klik Daftar)');
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
      setSuccessMsg('Karakter Hunter berhasil dibangkitkan oleh AI System!');

      // Generate and pre-seed user profile in isolated storage
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

      setTimeout(() => {
        onSuccess(username.trim());
      }, 700);
    } else {
      playSound.penaltyAlarm();
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="system-card w-full max-w-lg rounded-2xl p-6 md:p-8 text-cyan-50 shadow-2xl border border-cyan-500/60 glow-blue">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-400 mb-2 shadow glow-blue-sm">
            {isRegister && step === 2 ? <Brain className="w-6 h-6 animate-pulse" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white glow-text-blue">
            {isRegister && step === 2 ? 'AWAKENING ASSESSMENT' : 'SYSTEM ACCESS GATE'}
          </h2>
          <p className="text-xs text-cyan-300/80 font-mono mt-1">
            {isRegister
              ? (step === 1 ? 'Langkah 1: Akun Pribadi Rahasia' : 'Langkah 2: Penyesuaian Kepribadian & Quest AI')
              : 'Masuk ke Akun Hunter Pribadimu'}
          </p>
        </div>

        {/* Mode Switcher (Only on Step 1) */}
        {step === 1 && (
          <div className="flex rounded-lg bg-slate-950 p-1 mb-5 border border-cyan-900/60 font-mono text-xs">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
                !isRegister ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
                isRegister ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Daftar (Register)
            </button>
          </div>
        )}

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleNextStepOrSubmit} className="space-y-4 font-mono text-xs">
          {/* STEP 1: Username & Password */}
          {(!isRegister || step === 1) && (
            <>
              <div>
                <label className="block text-cyan-400 font-bold mb-1.5 uppercase tracking-wider">
                  Hunter Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username unik"
                    className="w-full bg-slate-950/90 border border-cyan-900 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan-400 font-bold mb-1.5 uppercase tracking-wider">
                  Secret Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password rahasia"
                    className="w-full bg-slate-950/90 border border-cyan-900 rounded-lg py-2.5 pl-10 pr-10 text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-cyan-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  className="w-full bg-slate-950/90 border border-cyan-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-cyan-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Tipe Kepribadian (MBTI)
                </label>
                <select
                  value={mbti}
                  onChange={(e) => setMbti(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
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
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Kelemahan Terbesar yang Ingin Kamu Hancurkan
                </label>
                <input
                  type="text"
                  required
                  value={primaryWeakness}
                  onChange={(e) => setPrimaryWeakness(e.target.value)}
                  placeholder="Contoh: Pemalas, Kurang Otot, Overthinking, Skripsi Tertunda"
                  className="w-full bg-slate-950/90 border border-cyan-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-cyan-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" /> Impian / Target Utama yang Ingin Dicapai
                </label>
                <input
                  type="text"
                  required
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="Contoh: Lulus Wisuda S1, Bentuk Otot Dada & Paha, Disiplin Waktu"
                  className="w-full bg-slate-950/90 border border-cyan-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            {isRegister && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
              >
                Kembali
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3 rounded-lg font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg glow-blue transition"
            >
              {isRegister
                ? (step === 1 ? 'Lanjut ke Tes Kepribadian →' : 'Bangkitkan Karakter (Generate AI)')
                : 'Buka Kunci Sistem'}
            </button>
          </div>
        </form>

        <div className="mt-5 text-center text-[10px] text-slate-400 border-t border-cyan-950/80 pt-3">
          100% Client-Side Privacy: Password & data pribadi di-hash dengan <strong>SHA-256</strong> dan hanya tersimpan di perangkat lokalmu. Tidak ada data yang dikirim ke server luar atau bocor ke GitHub.
        </div>
      </div>
    </div>
  );
};
