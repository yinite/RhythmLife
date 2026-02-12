export enum ViewState {
  HOME = 'HOME',
  FOCUS = 'FOCUS',
  MEDITATION = 'MEDITATION',
  HISTORY = 'HISTORY',
}

export interface DietRecord {
  standardBreakfast: boolean; // 按标准吃早餐
  standardLunch: boolean;     // 按标准吃午餐
  noDinner: boolean;          // 过午不食
}

export interface ExerciseRecord {
  jinGangGong: boolean;       // 金刚功
  strengthTraining: boolean;  // 力量训练
}

export interface JapaneseRecord {
  minutes: number;
  notes: string;              // 学习内容记录
}

export interface MeditationRecord {
  morning: number; // minutes
  noon: number;    // minutes (New)
  evening: number; // minutes
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  diet: DietRecord;
  exercise: ExerciseRecord;
  meditation: MeditationRecord;
  japanese: JapaneseRecord;
  weight: number | null;
  aiBriefing?: string;
}

export enum TaskType {
  CHARGE = 'CHARGE',
  DRAIN = 'DRAIN',
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: TaskType;
  category: string;
  energyValue: number;
}

export interface HabitBubbleConfig {
  id: string;
  label: string;
  icon: any;
  color: string;
}

// Helper to get default empty record
export const createDefaultRecord = (date: string): DailyRecord => ({
  date,
  diet: { standardBreakfast: false, standardLunch: false, noDinner: false },
  exercise: { jinGangGong: false, strengthTraining: false },
  meditation: { morning: 0, noon: 0, evening: 0 },
  japanese: { minutes: 0, notes: '' },
  weight: null
});