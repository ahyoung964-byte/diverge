import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { calcDayNumber, calcTotalDays, initialWorldState } from '@/lib/game';
import type { GameState, WorldState } from '@/lib/types';

export async function GET() {
  const db = supabaseServer();

  // 활성 시즌 조회
  const { data: season, error } = await db
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error || !season) {
    return NextResponse.json({ error: '활성 시즌 없음' }, { status: 404 });
  }

  const dayNumber = calcDayNumber(season);
  const totalDays = calcTotalDays(season);

  // 오늘의 세계 수치 조회 (없으면 초기값)
  const { data: states } = await db
    .from('world_states')
    .select('*')
    .eq('season_id', season.id)
    .eq('day_number', dayNumber);

  const worldStateA: WorldState =
    states?.find((s: WorldState) => s.faction === 'A') ??
    initialWorldState(season.id, dayNumber, 'A');
  const worldStateB: WorldState =
    states?.find((s: WorldState) => s.faction === 'B') ??
    initialWorldState(season.id, dayNumber, 'B');

  const result: GameState = { season, dayNumber, totalDays, worldStateA, worldStateB };
  return NextResponse.json(result);
}
