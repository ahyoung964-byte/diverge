'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NewsCard from '@/components/NewsCard';
import VotePanel from '@/components/VotePanel';
import WorldMeter from '@/components/WorldMeter';
import { getFaction, getUserId } from '@/lib/storage';
import type { GameState, DayNews, Faction, Choice } from '@/lib/types';

const STEPS = [
  '역사 기록 열람 중...',
  'AI 역사가 분석 중...',
  '두 세계선 뉴스 작성 중...',
  '오늘의 결정 구성 중...',
  '세계 수치 계산 중...',
];

function LoadingProgress() {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const DURATION = 15000;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(elapsed / DURATION, 0.97);
      setProgress(pct);
      setStepIdx(Math.min(Math.floor(pct * STEPS.length), STEPS.length - 1));
      if (pct < 0.97) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-8" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--ink-dim)' }}>DIVERGE</div>
        <div className="text-base font-medium" style={{ color: 'var(--ink)' }}>{STEPS[stepIdx]}</div>
      </div>
      <div className="w-full max-w-xs">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: 'var(--ink)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <div className="text-right mt-1 text-xs" style={{ color: 'var(--ink-dim)' }}>
          {Math.round(progress * 100)}%
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const [faction, setFactionState] = useState<Faction | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [news, setNews] = useState<DayNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    const f = getFaction();
    if (!f) { router.replace('/'); return; }
    setFactionState(f);

    const userId = getUserId();
    Promise.all([
      fetch('/api/game').then(r => r.json()),
      fetch(`/api/news?userId=${userId}`).then(r => r.json()),
    ]).then(([g, n]) => {
      setGame(g);
      setNews(n);
    }).finally(() => setLoading(false));
  }, [router]);

  const handleVote = useCallback(async (decisionId: string, choice: Choice) => {
    const userId = getUserId();
    setNewsLoading(true);
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, decisionId, choice }),
    });
    const data = await res.json();
    setNews(prev => prev ? {
      ...prev,
      myVotes: { ...prev.myVotes, [decisionId]: choice },
      voteCounts: { ...prev.voteCounts, [decisionId]: data.counts },
    } : prev);
    setNewsLoading(false);
  }, []);

  // suppress unused variable warning
  void newsLoading;

  if (loading) return <LoadingProgress />;

  if (!game || !news || !faction) return null;

  const season = game.season;
  const factionColor = faction === 'A' ? season.faction_a_color : season.faction_b_color;
  const factionName = faction === 'A' ? season.faction_a_name : season.faction_b_name;
  const myArticle = news.articles.find(a => a.faction === faction) ?? news.articles[0];
  const myDecision = news.decisions.find(d => d.faction === faction);
  const worldState = faction === 'A' ? game.worldStateA : game.worldStateB;

  return (
    <main className="min-h-screen pb-24 px-5 pt-8 max-w-lg mx-auto" style={{ background: 'var(--bg)' }}>
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-6 rise">
        <div>
          <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'var(--ink-dim)' }}>
            DIVERGE · {game.dayNumber}일차 / {game.totalDays}
          </div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{season.title}</h1>
        </div>
        <div
          className="text-xs px-3 py-1 rounded-full font-semibold"
          style={{ background: factionColor, color: 'var(--on-dark)' }}
        >
          {factionName}
        </div>
      </div>

      {/* 세계 수치 */}
      <div className="mb-5 fade-up" style={{ animationDelay: '50ms' }}>
        <WorldMeter
          label={factionName + ' 세계 현황'}
          morale={worldState.morale}
          prosperity={worldState.prosperity}
          conflict={worldState.conflict}
          color={factionColor}
        />
      </div>

      {/* 뉴스 */}
      {myArticle && (
        <div className="mb-4" style={{ animationDelay: '100ms' }}>
          <NewsCard
            article={myArticle}
            factionColor={factionColor}
            factionName={factionName}
          />
        </div>
      )}

      {/* 투표 */}
      {myDecision && (
        <div className="mb-4 fade-up" style={{ animationDelay: '150ms' }}>
          <VotePanel
            decision={myDecision}
            myChoice={(news.myVotes[myDecision.id] as Choice) ?? null}
            counts={news.voteCounts[myDecision.id] ?? { X: 0, Y: 0 }}
            factionColor={factionColor}
            onVote={handleVote}
          />
        </div>
      )}

      {/* 하단 네비 */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-4 px-5 max-w-lg mx-auto" style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
        <button
          onClick={() => router.push('/play')}
          className="text-xs font-semibold"
          style={{ color: factionColor }}
        >
          오늘
        </button>
        <button
          onClick={() => router.push('/timeline')}
          className="text-xs"
          style={{ color: 'var(--ink-soft)' }}
        >
          타임라인
        </button>
        <button
          onClick={() => router.push('/verdict')}
          className="text-xs"
          style={{ color: 'var(--ink-soft)' }}
        >
          판정
        </button>
      </nav>
    </main>
  );
}
