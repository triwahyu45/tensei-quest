export type RankType = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface PlayerStats {
  str: number; // Strength (Calisthenics & Physical Muscle)
  agi: number; // Agility (Consistency, Speed of Execution)
  vit: number; // Vitality (Health, Mood, Anti-Depression, Sleep)
  int: number; // Intellect (Mechatronics, PCB, Embedded, AI, Skripsi)
  per: number; // Perception (Mindfulness, Emotional Mastery)
}

export interface PlayerProfile {
  name: string;
  nim: string;
  rank: RankType;
  level: number;
  title: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  fatigue: number;
  maxFatigue: number;
  exp: number;
  maxExp: number;
  statPoints: number;
  stats: PlayerStats;
}

export interface DailyQuest {
  id: string;
  title: string;
  category: 'physical' | 'academic' | 'recovery';
  target: string;
  completed: boolean;
  xpReward: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  time: string;
  title: string;
  category: 'physical' | 'campus' | 'thesis' | 'recovery';
  description: string;
  completed: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  type: 'Passive' | 'Active';
  tier: 'Basic' | 'National' | 'Master' | 'Legendary';
  description: string;
  unlocked: boolean;
  realWorldProof: string;
}

export interface PenaltyTask {
  id: string;
  title: string;
  target: string;
  completed: boolean;
}

export interface PenaltyZoneState {
  isActive: boolean;
  reason: string;
  tasks: PenaltyTask[];
}
