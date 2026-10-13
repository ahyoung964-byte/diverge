import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { calcDayNumber, calcTotalDays, initialWorldState } from '@/lib/game';
import { generateVerdict } from '@/lib/anthropic';
import type { WorldState, NewsArticle } from '@/lib/types';

export async function GET() {
  const db = supabaseServer();

  const { data: season } = await db.from('seasons').select('*').eq('is_active', true).single();
  if (!season) return NextResponse.json({ error: '시즌 없음' }, { status: 404 });

  const dayNumber = calcDayNumber(season);
  const totalDays = calcTotalDays(season);

  if (dayNumber < totalDays) {
    return NextResponse.json({ locked: true, remainingDays: totalDays - dayNumber });
  }

  // 기존 판정 조회
  const { data: existing } = await db
    .from('verdicts')
    .select('*')
    .eq('season_id', season.id)
    .single();

  if (existing) return NextResponse.json({ verdict: existing, locked: false });

  // 판정 생성
  const { data: states } = await db
    .from('world_states')
    .select('*')
    .eq('season_id', season.id)
    .order('day_number', { ascending: false });

  const lastA: WorldState = states?.find((s: WorldState) => s.faction === 'A') ?? initialWorldState(season.id, totalDays, 'A');
  const lastB: WorldState = states?.find((s: WorldState) => s.faction === 'B') ?? initialWorldState(season.id, totalDays, 'B');

  const { data: articles } = await db
    .from('news_articles')
    .select('headline')
    .eq('season_id', season.id)
    .order('day_number', { ascending: true });

  const headlines = (articles ?? []).map((a: Pick<NewsArticle, 'headline'>) => a.headline);

  const { content, winner } = await generateVerdict({
    diversionPoint: season.diversion_point,
    factionAName: season.faction_a_name,
    factionADesc: season.faction_a_desc,
    factionBName: season.faction_b_name,
    factionBDesc: season.faction_b_desc,
    worldStateA: lastA,
    worldStateB: lastB,
    headlines,
  });

  const { data: saved } = await db
    .from('verdicts')
    .insert({ season_id: season.id, content, winner })
    .select()
    .single();

  return NextResponse.json({ verdict: saved, locked: false });
}
