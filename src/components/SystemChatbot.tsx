import React, { useState } from 'react';
import type { PlayerProfile } from '../types';
import { askLocalArchitectAI } from '../utils/localAI';
import { playSound } from '../utils/audio';
import { Bot, Send, Sparkles, User, HelpCircle } from 'lucide-react';

interface SystemChatbotProps {
  player: PlayerProfile;
}

interface ChatMessage {
  id: string;
  sender: 'system' | 'user';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  'Aku lagi males banget, gimana cara mulai?',
  'Cara bangun otot dari 0 tanpa alat?',
  'Skripsiku macet dan bikin overthinking',
  'Bagaimana karakter MBTI-ku bisa sukses?',
];

export const SystemChatbot: React.FC<SystemChatbotProps> = ({ player }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'system',
      text: `Salam, Player [${player.name}]. Aku adalah System Architect pribadimu. Sistem ini berjalan 100% di perangkat lokalmu tanpa API key eksternal. Tanyakan apa saja terkait penanganan kemalasan, latihan calisthenics, atau strategi penaklukan tugas kampusmu.`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (textToSend?: string) => {
    const question = textToSend || input;
    if (!question.trim()) return;

    playSound.questComplete();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: question.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Instant local AI response
    setTimeout(() => {
      playSound.statPoint();
      const answer = askLocalArchitectAI(question, player);
      const systemMsg: ChatMessage = {
        id: `s-${Date.now()}`,
        sender: 'system',
        text: answer,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, systemMsg]);
    }, 350);
  };

  return (
    <div className="system-card rounded-xl p-5 md:p-6 text-cyan-50 shadow-2xl relative overflow-hidden flex flex-col h-[650px]">
      {/* Header */}
      <div className="border-b border-cyan-800/60 pb-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-400 shadow glow-blue-sm">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white glow-text-blue flex items-center gap-1.5">
              THE SYSTEM ARCHITECT (LOCAL AI)
            </h2>
            <p className="text-[11px] text-cyan-300/80 font-mono">
              100% Offline & Private &bull; Membantu Eksekusi & Pemulihan Mental
            </p>
          </div>
        </div>
        <div className="text-[10px] bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 px-2.5 py-1 rounded font-mono flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Zero API Key Leak
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 font-mono text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'system' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-300">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3.5 whitespace-pre-line leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-cyan-700 text-white rounded-tr-none'
                  : 'bg-slate-950/80 border border-cyan-900/60 text-cyan-100 rounded-tl-none'
              }`}
            >
              <div className="text-[10px] text-cyan-400/80 mb-1 flex justify-between items-center">
                <span>{msg.sender === 'user' ? player.name : 'System Voice'}</span>
                <span>{msg.time}</span>
              </div>
              {msg.text}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="pt-3 border-t border-cyan-900/60 my-2">
        <div className="text-[10px] text-cyan-400 font-mono mb-1.5 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Rekomendasi Pertanyaan Cepat:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[10px] font-mono bg-slate-950/90 border border-cyan-800/40 hover:border-cyan-400 hover:text-white text-cyan-300 px-2.5 py-1 rounded transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="pt-2 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ketik konsultasimu kepada System AI (contoh: 'lagi mager banget')..."
          className="flex-1 bg-slate-950 border border-cyan-900/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow glow-blue-sm transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
