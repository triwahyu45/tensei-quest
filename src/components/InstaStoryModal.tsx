import React, { useRef, useState } from 'react';
import type { PlayerProfile, DailyQuest } from '../types';
import { toPng, toBlob } from 'html-to-image';
import { X, Download, Share2, Sparkles, CheckCircle2, Shield, Flame } from 'lucide-react';
import { playSound } from '../utils/audio';

interface InstaStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  quests: DailyQuest[];
}

export const InstaStoryModal: React.FC<InstaStoryModalProps> = ({
  isOpen,
  onClose,
  player,
  quests,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const completedQuests = quests.filter((q) => q.completed);
  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      playSound.questComplete();
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2.5, // Crisp HD 1080p+ export
      });
      const link = document.createElement('a');
      link.download = `Solo_Leveling_Story_${player.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Gagal membuat gambar story. Coba lagi!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const blob = await toBlob(cardRef.current, { quality: 0.98, pixelRatio: 2.5 });
      if (!blob) throw new Error('Blob conversion failed');

      const file = new File([blob], `Solo_Leveling_Quest_${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Solo Leveling: Daily Quest Completed',
          text: `Saya telah menuntaskan quest harian Solo Leveling! [Lv. ${player.level} Rank ${player.rank}]`,
        });
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch (err) {
      console.error('Share failed:', err);
      handleDownload();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm md:max-w-md my-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between mb-3 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Insta Story Generator
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:text-red-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The 9:16 Instagram Story Canvas */}
        <div
          ref={cardRef}
          className="w-full aspect-[9/16] bg-gradient-to-b from-[#030712] via-[#051126] to-[#02050e] rounded-2xl p-6 text-white border-2 border-cyan-500/70 shadow-2xl relative flex flex-col justify-between overflow-hidden"
          style={{
            boxShadow: '0 0 35px rgba(0, 217, 255, 0.45)',
          }}
        >
          {/* Neon Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>

          {/* Top Section */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 border-b border-cyan-800/60 pb-3">
              <span className="flex items-center gap-1 uppercase tracking-widest font-bold">
                <Shield className="w-3.5 h-3.5" /> SYSTEM AWAKENING
              </span>
              <span>{todayDate}</span>
            </div>

            {/* Title & Player Info */}
            <div className="mt-5 text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-600/40 px-3 py-1 rounded-full inline-block mb-2">
                DAILY QUEST REPORT
              </span>
              <h1 className="text-2xl font-black tracking-wider text-white drop-shadow glow-text-blue">
                {player.name}
              </h1>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">
                {player.title}
              </p>
            </div>

            {/* Rank & Level Medallion */}
            <div className="my-5 flex items-center justify-center gap-4">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-700 px-5 py-2 rounded-xl text-center shadow-lg border border-cyan-300/40">
                <div className="text-[9px] uppercase font-mono text-cyan-200">Hunter Rank</div>
                <div className="text-2xl font-black tracking-widest text-white">RANK {player.rank}</div>
              </div>
              <div className="bg-slate-950 border border-cyan-500/50 px-5 py-2 rounded-xl text-center shadow-lg">
                <div className="text-[9px] uppercase font-mono text-cyan-400">Current Level</div>
                <div className="text-2xl font-black font-mono text-cyan-300">Lv. {player.level}</div>
              </div>
            </div>

            {/* Quest Completed Checklist */}
            <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-4 my-2 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400 mb-2 border-b border-cyan-900/40 pb-1.5">
                <span>QUEST COMPLETED TODAY</span>
                <span className="text-emerald-400">{completedQuests.length} / {quests.length}</span>
              </div>

              <div className="space-y-2">
                {quests.slice(0, 5).map((q) => (
                  <div key={q.id} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-200 font-medium truncate pr-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${q.completed ? 'text-cyan-400' : 'text-slate-600'}`} />
                      <span className={q.completed ? 'text-white' : 'text-slate-500 line-through'}>{q.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">{q.target}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Snippet */}
            <div className="grid grid-cols-3 gap-2 text-center mt-3 font-mono text-[11px]">
              <div className="bg-cyan-950/40 border border-cyan-900/40 rounded-lg p-1.5">
                <span className="text-slate-400 block text-[9px]">STR (Otot)</span>
                <span className="font-bold text-white text-sm">{player.stats.str}</span>
              </div>
              <div className="bg-cyan-950/40 border border-cyan-900/40 rounded-lg p-1.5">
                <span className="text-slate-400 block text-[9px]">AGI (Aksi)</span>
                <span className="font-bold text-white text-sm">{player.stats.agi}</span>
              </div>
              <div className="bg-cyan-950/40 border border-cyan-900/40 rounded-lg p-1.5">
                <span className="text-slate-400 block text-[9px]">INT (Otak)</span>
                <span className="font-bold text-white text-sm">{player.stats.int}</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="mt-4 pt-3 border-t border-cyan-800/60 text-center">
            <p className="text-[11px] italic text-cyan-200/90 font-serif leading-snug">
              &ldquo;Tidak ada lagi alasan untuk menyerah. Setiap repetisi adalah langkah menuju kebangkitan.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-cyan-400/80 mt-2 uppercase tracking-widest">
              <Flame className="w-3 h-3 text-cyan-400" /> Powered by Solo Leveling System
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2.5 font-mono text-xs">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg glow-blue transition"
          >
            <Download className="w-4 h-4" /> {isExporting ? 'Memproses HD...' : 'Download PNG'}
          </button>

          <button
            onClick={handleNativeShare}
            disabled={isExporting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Share2 className="w-4 h-4" /> Share ke Story
          </button>
        </div>
      </div>
    </div>
  );
};
