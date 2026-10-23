// Local Client-Side AI Engine ("The System Architect")
// Runs 100% locally on user device without external API keys or tokens.
// Completely zero-cost, private, and offline-capable.

import type { PlayerStats, DailyQuest, PlayerProfile } from '../types';
import type { HunterProfileSetup } from './auth';

export interface GeneratedHunterPackage {
  title: string;
  stats: PlayerStats;
  customQuests: DailyQuest[];
  diagnosisNote: string;
}

export function generateHunterPackage(setup: HunterProfileSetup): GeneratedHunterPackage {
  const mbtiUpper = setup.mbti.toUpperCase().trim();
  const weakness = setup.primaryWeakness.toLowerCase();

  // Baseline stats
  const stats: PlayerStats = {
    str: 10,
    agi: 10,
    vit: 10,
    int: 15,
    per: 10,
  };

  // Adjust stats by MBTI
  if (mbtiUpper.includes('ENFP')) {
    stats.int = 35; // Creative engineering / brainstorming
    stats.per = 18; // High empathy & feeling
    stats.agi = 8;  // Lower follow-through consistency
    stats.str = 8;  // Lower physical focus
    stats.vit = 9;  // Sensitive to emotional burnouts
  } else if (mbtiUpper.includes('INTJ') || mbtiUpper.includes('ENTJ')) {
    stats.int = 38;
    stats.agi = 14;
    stats.per = 12;
    stats.vit = 8;
  } else if (mbtiUpper.includes('INTP') || mbtiUpper.includes('ENTP')) {
    stats.int = 36;
    stats.agi = 9;
    stats.str = 8;
  } else if (mbtiUpper.includes('ISTP') || mbtiUpper.includes('ESTP')) {
    stats.str = 14;
    stats.agi = 14;
    stats.int = 18;
  }

  // Adjust for weaknesses
  if (weakness.includes('otot') || weakness.includes('gendut') || weakness.includes('fisik')) {
    stats.str = Math.min(stats.str, 8);
  }
  if (weakness.includes('prokrastinasi') || weakness.includes('malas')) {
    stats.agi = Math.min(stats.agi, 7);
  }
  if (weakness.includes('depresi') || weakness.includes('overthinking')) {
    stats.vit = Math.min(stats.vit, 8);
  }

  // Custom Quests tailored to user
  const customQuests: DailyQuest[] = [
    {
      id: 'q-calisthenics-1',
      title: 'Push-Up Pemula (Wall / Incline Kasur)',
      category: 'physical',
      target: '10 Repetisi x 2 Set',
      completed: false,
      xpReward: 25,
    },
    {
      id: 'q-calisthenics-2',
      title: 'Bodyweight Squat (Bakar Lemak & Bangun Otot Paha)',
      category: 'physical',
      target: '15 Repetisi x 2 Set',
      completed: false,
      xpReward: 25,
    },
    {
      id: 'q-calisthenics-3',
      title: 'Plank Penguat Core & Postur Tubuh',
      category: 'physical',
      target: '30 Detik',
      completed: false,
      xpReward: 20,
    },
    {
      id: 'q-cardio-walk',
      title: 'Jalan Santai / Lari Pagi (Kardio & Reset Mood)',
      category: 'physical',
      target: '1.0 Kilometer (~15 Menit)',
      completed: false,
      xpReward: 30,
    },
    {
      id: 'q-water-detox',
      title: 'Rehidrasi Alami: 2 Gelas Air Putih Saat Bangun',
      category: 'recovery',
      target: '500 ml Langsung Bangun Tidur',
      completed: false,
      xpReward: 15,
    },
    {
      id: 'q-academic-focus',
      title: setup.targetGoal.toLowerCase().includes('skripsi')
        ? 'Deep Work: 20 Menit Buka Dokumen Skripsi / Kuliah'
        : 'Deep Work: 20 Menit Fokus Target Utama',
      category: 'academic',
      target: '20 Menit Tanpa Buka Media Sosial',
      completed: false,
      xpReward: 35,
    },
  ];

  const title = `The Awakened ${mbtiUpper} Vanguard`;
  const diagnosisNote = `Analisis Tipe ${mbtiUpper}: Karaktermu memiliki daya imajinasi dan kecerdasan tinggi, namun rentan terhambat pada eksekusi konsisten akibat dopamine crash. Sistem telah merancang quest berbobot mikro agar kamu tidak merasa overwhelmed dan bisa naik level secara nyata.`;

  return {
    title,
    stats,
    customQuests,
    diagnosisNote,
  };
}

export function askLocalArchitectAI(question: string, player: PlayerProfile): string {
  const q = question.toLowerCase();

  if (q.includes('malas') || q.includes('mager') || q.includes('mulai')) {
    return `[Sistem Tensei Quest]: Rasa 'malas' sebenarnya hanyalah sinyal otakmu yang takut akan beban besar atau kekurangan dopamin. 
Solusi Taktis: Jangan targetkan lari 5 km atau tulis 10 halaman skripsi sekarang. Cukup ambil komitmen 2 MENIT: berdiri dari kasur, minum 1 gelas air putih, dan lakukan 5 kali push-up di dinding/kasur. Begitu tubuhmu bergerak, hormon dopamin akan otomatis mengalir dan inersia kemalasanmu akan pecah.`;
  }

  if (q.includes('otot') || q.includes('gendut') || q.includes('berat badan') || q.includes('olahraga')) {
    return `[Sistem Tensei Quest]: Tubuh atletis dibangun dari konsistensi, bukan dari durasi gym berjam-jam. 
Karena level STR-mu saat ini ${player.stats.str}, fokuslah pada Calisthenics dasar:
1. Incline push-up di tepi kasur/meja (membentuk dada & bahu).
2. Squats tubuh sendiri (otot paha adalah pembakar kalori terbesar).
3. Kurangi minuman manis saset dan perbanyak minum air putih. Lakukan tiap hari 15 menit, dalam 30 hari tubuhmu akan terasa jauh lebih ringan dan padat.`;
  }

  if (q.includes('skripsi') || q.includes('kampus') || q.includes('kuliah') || q.includes('rektorat')) {
    return `[Sistem Tensei Quest]: Skripsi atau birokrasi kampus tampak seperti monster besar karena kamu memikirkannya sekaligus. 
Gunakan aturan '1 Babak Saja': Hari ini jangan pikirkan ujian sidang; cukup ketik atau edit 1 paragraf saja, atau siapkan 1 lembar berkas. Skripsi yang baik bukanlah skripsi yang sempurna di kepala, melainkan skripsi yang selesai di dunia nyata.`;
  }

  if (q.includes('depresi') || q.includes('gagal') || q.includes('cemas') || q.includes('stres')) {
    return `[Sistem Tensei Quest]: Kamu merasa gagal karena kamu membandingkan dirimu yang sedang kelelahan dengan standar kesempurnaan di masa lalumu. 
Ingat: Kamu sudah pernah membuktikan dirimu menjadi Juara Nasional Robotika dan pelatih. Kemampuanmu tidak hilang. Bateraimu hanya sedang drop karena beban keluarga dan hidup yang menumpuk. Izinkan dirimu beristirahat tanpa rasa bersalah, lalu maju selangkah demi selangkah.`;
  }

  return `[Sistem Tensei Quest]: Pertanyaan tercatat dalam protokol. Ingat bahwa di dalam dunia Tensei Quest, setiap tugas kecil yang kamu centang hari ini bernilai XP nyata. Jangan biarkan keraguan menghentikan langkahmu; fokus pada quest harian terdekatmu sekarang!`;
}
