import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { generateNewsForFaction } from '@/lib/anthropic';
import { calcDayNumber, clamp, initialWorldState } from '@/lib/game';
import type { DayNews, NewsArticle, DailyDecision, Vote, WorldState, Choice } from '@/lib/types';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? '';
  const db = supabaseServer();

  // 활성 시즌
  const { data: season } = await db.from('seasons').select('*').eq('is_active', true).single();
  if (!season) return NextResponse.json({ error: '시즌 없음' }, { status: 404 });

  const dayNumber = calcDayNumber(season);

  // 오늘 뉴스 캐시 확인
  const { data: existingNews } = await db
    .from('news_articles')
    .select('*')
    .eq('season_id', season.id)
    .eq('day_number', dayNumber);

  let articles: NewsArticle[] = (existingNews as NewsArticle[]) ?? [];

  // 뉴스가 없으면 AI 생성
  if (articles.length < 2) {
    // 어제 결정 결과 조회
    let prevDecisionResultA: string | null = null;
    let prevDecisionResultB: string | null = null;

    if (dayNumber > 1) {
      const { data: prevDecisions } = await db
        .from('daily_decisions')
        .select('*, votes(choice)')
        .eq('season_id', season.id)
        .eq('day_number', dayNumber - 1);

      for (const d of (prevDecisions ?? []) as (DailyDecision & { votes: Vote[] })[]) {
        const xCount = d.votes.filter((v) => v.choice === 'X').length;
        const yCount = d.votes.filter((v) => v.choice === 'Y').length;
        const winner = xCount >= yCount ? d.option_x : d.option_y;
        const summary = `"${d.question}" → 다수결: "${winner}"`;
        if (d.faction === 'A') prevDecisionResultA = summary;
        else prevDecisionResultB = summary;
      }
    }

    // 현재 세계 수치
    const { data: states } = await db
      .from('world_states')
      .select('*')
      .eq('season_id', season.id)
      .eq('day_number', dayNumber);

    const wsA: WorldState =
      (states as WorldState[])?.find((s) => s.faction === 'A') ??
      initialWorldState(season.id, dayNumber, 'A');
    const wsB: WorldState =
      (states as WorldState[])?.find((s) => s.faction === 'B') ??
      initialWorldState(season.id, dayNumber, 'B');

    // A, B 뉴스 생성 (병렬)
    const [genA, genB] = await Promise.all([
      generateNewsForFaction({
        diversionPoint: season.diversion_point,
        factionName: season.faction_a_name,
        factionDesc: season.faction_a_desc,
        faction: 'A',
        dayNumber,
        prevDecisionResult: prevDecisionResultA,
        worldState: wsA,
      }),
      generateNewsForFaction({
        diversionPoint: season.diversion_point,
        factionName: season.faction_b_name,
        factionDesc: season.faction_b_desc,
        faction: 'B',
        dayNumber,
        prevDecisionResult: prevDecisionResultB,
        worldState: wsB,
      }),
    ]);

    // DB에 저장
    const { data: savedNews } = await db
      .from('news_articles')
      .insert([
        {
          season_id: season.id,
          day_number: dayNumber,
          faction: 'A',
          headline: genA.headline,
          body: genA.body,
          morale_delta: genA.morale_delta,
          prosperity_delta: genA.prosperity_delta,
          conflict_delta: genA.conflict_delta,
        },
        {
          season_id: season.id,
          day_number: dayNumber,
          faction: 'B',
          headline: genB.headline,
          body: genB.body,
          morale_delta: genB.morale_delta,
          prosperity_delta: genB.prosperity_delta,
          conflict_delta: genB.conflict_delta,
        },
      ])
      .select();

    articles = (savedNews as NewsArticle[]) ?? [];

    // 결정 저장
    await db.from('daily_decisions').insert([
      {
        season_id: season.id,
        day_number: dayNumber,
        faction: 'A',
        question: genA.decision.question,
        option_x: genA.decision.option_x,
        option_y: genA.decision.option_y,
      },
      {
        season_id: season.id,
        day_number: dayNumber,
        faction: 'B',
        question: genB.decision.question,
        option_x: genB.decision.option_x,
        option_y: genB.decision.option_y,
      },
    ]);

    // 세계 수치 업데이트
    await db.from('world_states').upsert([
      {
        season_id: season.id,
        day_number: dayNumber,
        faction: 'A',
        morale: clamp(wsA.morale + genA.morale_delta),
        prosperity: clamp(wsA.prosperity + genA.prosperity_delta),
        conflict: clamp(wsA.conflict + genA.conflict_delta),
      },
      {
        season_id: season.id,
        day_number: dayNumber,
        faction: 'B',
        morale: clamp(wsB.morale + genB.morale_delta),
        prosperity: clamp(wsB.prosperity + genB.prosperity_delta),
        conflict: clamp(wsB.conflict + genB.conflict_delta),
      },
    ]);
  }

  // 결정 조회
  const { data: decisions } = await db
    .from('daily_decisions')
    .select('*')
    .eq('season_id', season.id)
    .eq('day_number', dayNumber);

  // 내 투표 조회
  const decisionIds = ((decisions ?? []) as DailyDecision[]).map((d) => d.id);
  const myVotes: Record<string, Choice> = {};
  const voteCounts: Record<string, { X: number; Y: number }> = {};

  if (userId && decisionIds.length > 0) {
    const { data: myVoteRows } = await db
      .from('votes')
      .select('decision_id, choice')
      .eq('user_id', userId)
      .in('decision_id', decisionIds);

    for (const v of (myVoteRows ?? []) as { decision_id: string; choice: Choice }[]) {
      myVotes[v.decision_id] = v.choice;
    }
  }

  // 전체 투표 집계
  if (decisionIds.length > 0) {
    const { data: allVotes } = await db
      .from('votes')
      .select('decision_id, choice')
      .in('decision_id', decisionIds);

    for (const did of decisionIds) {
      const dv = ((allVotes ?? []) as { decision_id: string; choice: Choice }[]).filter(
        (v) => v.decision_id === did,
      );
      voteCounts[did] = {
        X: dv.filter((v) => v.choice === 'X').length,
        Y: dv.filter((v) => v.choice === 'Y').length,
      };
    }
  }

  const result: DayNews = {
    articles,
    decisions: (decisions ?? []) as DailyDecision[],
    myVotes,
    voteCounts,
  };

  return NextResponse.json(result);
}
