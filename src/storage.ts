import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang } from './i18n';

const KEY = 'estafet-draft:v1';

export interface Save {
  lang: Lang;
  /** day -> draft number -> final score */
  days: Record<string, Record<number, number>>;
  best: number;
  streak: number;
  lastDay: string | null;
}

export const EMPTY: Save = { lang: 'az', days: {}, best: 0, streak: 0, lastDay: null };

export async function load(): Promise<Save> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function persist(save: Save): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // storage unavailable: the game still works for this session
  }
}

function dayBefore(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const dt = new Date(y, m - 1, d - 1);
  const mm = `${dt.getMonth() + 1}`.padStart(2, '0');
  const dd = `${dt.getDate()}`.padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

export function recordDaily(save: Save, day: string, draftNo: number, total: number): Save {
  const streak =
    save.lastDay === day ? save.streak : save.lastDay === dayBefore(day) ? save.streak + 1 : 1;
  return {
    ...save,
    days: { ...save.days, [day]: { ...(save.days[day] ?? {}), [draftNo]: total } },
    best: Math.max(save.best, total),
    streak,
    lastDay: day,
  };
}
