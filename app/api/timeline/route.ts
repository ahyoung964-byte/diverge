import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { calcDayNumber } from '@/lib/game';
import type { NewsArticle, WorldState } from '@/lib/types';

export interface TimelineDay {
  dayNumber: number;
  newsA: NewsArticle | null;
  newsB: NewsArticle | null;
  worldStateA: WorldState | null;
  worldStateB: WorldState | null;
}

export async function GET() {
  const db = supabaseServer();

  const { data: season } = await db.from('seasons').select('*').eq('is_active', true).single();
  if (!season) return NextResponse.json({ error: '시즌 없음' }, { status: 404 });

  const today = calcDayNumber(season);

  const { data: articles } = await db
    .from('news_articles')
    .select('*')
    .eq('season_id', season.id)
    .order('day_number', { ascending: true });

  const { data: states } = await db
    .from('world_states')
    .select('*')
    .eq('season_id', season.id)
    .order('day_number', { ascending: true });

  const days: TimelineDay[] = [];
  for (let d = 1; d <= today; d++) {
    const dayArticles = (articles ?? []).filter((a: NewsArticle) => a.day_number === d);
    const dayStates = (states ?? []).filter((s: WorldState) => s.day_number === d);
    days.push({
      dayNumber: d,
      newsA: dayArticles.find((a: NewsArticle) => a.faction === 'A') ?? null,
      newsB: dayArticles.find((a: NewsArticle) => a.faction === 'B') ?? null,
      worldStateA: dayStates.find((s: WorldState) => s.faction === 'A') ?? null,
      worldStateB: dayStates.find((s: WorldState) => s.faction === 'B') ?? null,
    });
  }

  return NextResponse.json({ days, season });
}
