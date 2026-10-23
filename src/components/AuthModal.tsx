import React, { useState } from 'react';
import { authenticateUser, registerNewUser } from '../utils/auth';
import { playSound } from '../utils/audio';
import { Lock, User, UserPlus, LogIn, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (username: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('Triwahyu45');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegister) {
      const res = await registerNewUser(username, password);
      if (res.success) {
        playSound.levelUp();
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess(username.trim());
        }, 600);
      } else {
        playSound.penaltyAlarm();
        setErrorMsg(res.message);
      }
    } else {
      const isValid = await authenticateUser(username, password);
      if (isValid) {
        playSound.questComplete();
        onSuccess(username.trim());
      } else {
        playSound.penaltyAlarm();
        setErrorMsg('Username atau Password Hunter salah!');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="system-card w-full max-w-md rounded-2xl p-6 md:p-8 text-cyan-50 shadow-2xl border border-cyan-500/50 glow-blue">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-400 mb-2 shadow glow-blue-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white glow-text-blue">
            SYSTEM ACCESS GATE
          </h2>
          <p className="text-xs text-cyan-300/80 font-mono mt-1">
            {isRegister ? 'Pendaftaran Hunter Baru' : 'Autentikasi Pemain Solo Leveling'}
          </p>
        </div>

        {/* Mode Switcher */}
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
            onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); setUsername(''); setPassword(''); }}
            className={`flex-1 py-2 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
              isRegister ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Daftar (Register)
          </button>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
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
                placeholder="Contoh: Triwahyu45"
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

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-lg font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg glow-blue transition"
          >
            {isRegister ? 'Aktifkan Akun Hunter' : 'Buka Kunci Sistem'}
          </button>
        </form>

        <div className="mt-5 text-center text-[10px] text-slate-400 border-t border-cyan-950/80 pt-3">
          Password dienkripsi dengan standar <strong>SHA-256</strong>. Tidak disimpan dalam plain text dan aman saat di-push ke GitHub.
        </div>
      </div>
    </div>
  );
};
