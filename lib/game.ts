import type { Season, WorldState } from './types';

/** 시즌 시작일 기준 오늘이 몇 번째 날인지 (1-based) */
export function calcDayNumber(season: Season): number {
  const start = new Date(season.start_date);
  const now = new Date();
  // 날짜만 비교 (시간 제거)
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, diff + 1);
}

/** 시즌 총 일수 */
export function calcTotalDays(season: Season): number {
  const start = new Date(season.start_date);
  const end = new Date(season.end_date);
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

/** 수치를 0-100 사이로 클램프 */
export function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/** 초기 WorldState */
export function initialWorldState(seasonId: string, dayNumber: number, faction: 'A' | 'B'): WorldState {
  return { season_id: seasonId, day_number: dayNumber, faction, morale: 50, prosperity: 50, conflict: 50 };
}
