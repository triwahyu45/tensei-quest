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
          <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2.5 py-1 rounded-md flex items-center gap-1 font-mono font-semibold">
            <Dumbbell className="w-3.5 h-3.5" /> Fisik & Otot
          </span>
        );
      case 'campus':
        return (
          <span className="text-xs bg-blue-950 text-blue-300 border border-blue-700/60 px-2.5 py-1 rounded-md flex items-center gap-1 font-mono font-semibold">
            <GraduationCap className="w-3.5 h-3.5" /> Kampus / Birokrasi
          </span>
        );
      case 'thesis':
        return (
          <span className="text-xs bg-purple-950 text-purple-300 border border-purple-700/60 px-2.5 py-1 rounded-md flex items-center gap-1 font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Skripsi (8 SKS)
          </span>
        );
      default:
        return (
          <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded-md flex items-center gap-1 font-mono font-semibold">
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
    <div className="system-card rounded-2xl p-5 md:p-7 text-cyan-50 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
              [ACADEMIC TIMETABLE SYSTEM]
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white glow-text-blue mt-1 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-cyan-400" /> JADWAL HARIAN GAYA KULIAH
          </h2>
          <p className="text-xs sm:text-sm text-cyan-300/80 mt-0.5">
            Panduan harian terstruktur. Bebaskan kepalamu dari bingung mau ngapain tiap hari.
          </p>
        </div>
      </div>

      {/* Swipeable Day Selector Tabs */}
      <div className="my-4 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex gap-2 min-w-max bg-slate-950/90 p-2 rounded-xl border border-cyan-900/60 font-mono">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition min-h-[44px] flex items-center justify-center ${
                selectedDay === day
                  ? 'bg-cyan-600 text-white shadow-lg glow-blue-sm scale-105'
                  : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Items */}
      <div className="my-5 space-y-3.5">
        {filteredSlots.length === 0 ? (
          <div className="text-center py-12 text-slate-300 font-mono text-sm border-2 border-dashed border-cyan-900/40 rounded-xl p-6">
            Tidak ada agenda khusus di hari {selectedDay}. Gunakan untuk istirahat atau menuntaskan quest yang tertunda!
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => handleToggle(slot.id)}
              className={`cursor-pointer rounded-xl p-4 sm:p-5 border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3.5 active:scale-[0.99] min-h-[72px] ${
                slot.completed
                  ? 'bg-cyan-950/20 border-cyan-800/40 text-slate-400'
                  : 'bg-slate-950/80 border-cyan-900/60 hover:border-cyan-400 hover:bg-slate-900/80 text-white shadow-sm'
              }`}
            >
              <div className="flex items-start md:items-center gap-3.5 flex-1">
                <button className="text-cyan-400 hover:text-cyan-300 transition mt-1 md:mt-0 p-1 shrink-0">
                  {slot.completed ? (
                    <CheckSquare className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <Square className="w-6 h-6 text-slate-500" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> {slot.time}
                    </span>
                    {getCategoryBadge(slot.category)}
                  </div>

                  <h3 className={`text-base sm:text-lg font-bold mt-2 tracking-wide ${slot.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {slot.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {slot.description}
                  </p>
                </div>
              </div>

              <div className="self-end md:self-center shrink-0">
                <span className={`text-xs font-mono px-3 py-1.5 rounded-lg font-bold border ${
                  slot.completed
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                    : 'bg-slate-900 text-amber-300 border-amber-900/60'
                }`}>
                  {slot.completed ? 'COMPLETED' : 'PENDING'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Footer */}
      <div className="border-t border-cyan-800/60 pt-3.5 text-xs text-cyan-400 font-mono flex items-center justify-between">
        <span>&bull; Tugas yang belum dicentang akan tetap tampil di daftar.</span>
        <span>Target: Konsistensi Harian</span>
      </div>
    </div>
  );
};
