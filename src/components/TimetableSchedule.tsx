import React, { useState } from 'react';
import type { TimetableSlot } from '../types';
import { Calendar, Clock, CheckSquare, Square, Dumbbell, GraduationCap, Sparkles } from 'lucide-react';
import { playSound } from '../utils/audio';

interface TimetableScheduleProps {
  slots: TimetableSlot[];
  onToggleSlot: (slotId: string) => void;
}

const DAYS: Array<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu'> = [
  'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
];

export const TimetableSchedule: React.FC<TimetableScheduleProps> = ({ slots, onToggleSlot }) => {
  const [selectedDay, setSelectedDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu'>('Senin');

  const filteredSlots = slots.filter((slot) => slot.day === selectedDay);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'physical':
        return (
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
            <Dumbbell className="w-3 h-3" /> Fisik & Otot
          </span>
        );
      case 'campus':
        return (
          <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
            <GraduationCap className="w-3 h-3" /> Kampus / Birokrasi
          </span>
        );
      case 'thesis':
        return (
          <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3" /> Skripsi (8 SKS)
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
            Pemulihan Mental
          </span>
        );
    }
  };

  const handleToggle = (id: string) => {
    playSound.questComplete();
    onToggleSlot(id);
  };

  return (
    <div className="system-card rounded-xl p-5 md:p-6 text-cyan-50 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyan-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">Academic Schedule Layout</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white glow-text-blue mt-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-400" /> JADWAL HARIAN GAYA KULIAH
          </h2>
          <p className="text-xs text-cyan-300/80">
            Jadwal terstruktur anti-bingung. Kamu tinggal ikuti panduan jam ini tanpa pusing memutuskan hal baru tiap hari.
          </p>
        </div>

        {/* Day Selectors */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-cyan-900/50">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 rounded text-xs font-bold transition font-mono ${
                selectedDay === day
                  ? 'bg-cyan-600 text-white shadow glow-blue-sm'
                  : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Items */}
      <div className="my-5 space-y-3">
        {filteredSlots.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-mono text-sm border border-dashed border-cyan-900/40 rounded-lg">
            Tidak ada agenda khusus di hari {selectedDay}. Gunakan untuk istirahat atau menuntaskan quest yang tertunda!
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => handleToggle(slot.id)}
              className={`cursor-pointer rounded-lg p-4 border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                slot.completed
                  ? 'bg-cyan-950/20 border-cyan-800/40 text-slate-400'
                  : 'bg-slate-950/70 border-cyan-900/50 hover:border-cyan-500 hover:bg-slate-900/70 text-white'
              }`}
            >
              <div className="flex items-start md:items-center gap-3">
                <button className="text-cyan-400 hover:text-cyan-300 transition mt-0.5 md:mt-0">
                  {slot.completed ? (
                    <CheckSquare className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" /> {slot.time}
                    </span>
                    {getCategoryBadge(slot.category)}
                  </div>

                  <h3 className={`text-base font-bold mt-1.5 tracking-wide ${slot.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {slot.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {slot.description}
                  </p>
                </div>
              </div>

              <div className="self-end md:self-center">
                <span className={`text-[11px] font-mono px-2.5 py-1 rounded font-bold border ${
                  slot.completed
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                    : 'bg-slate-900 text-amber-300 border-amber-900/40'
                }`}>
                  {slot.completed ? 'COMPLETED' : 'PENDING'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Footer */}
      <div className="border-t border-cyan-800/60 pt-3 text-xs text-cyan-400/80 font-mono flex items-center justify-between">
        <span>&bull; Tugas yang belum dicentang akan tetap berada di daftar.</span>
        <span>Target: Konsistensi Harian</span>
      </div>
    </div>
  );
};
