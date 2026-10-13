'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FactionCard from '@/components/FactionCard';
import { getFaction, setFaction } from '@/lib/storage';
import type { GameState, Faction } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 이미 진영 선택했으면 /play 이동
    const saved = getFaction();
    if (saved) { router.replace('/play'); return; }

    fetch('/api/game')
      .then(r => r.json())
      .then(setGame)
      .finally(() => setLoading(false));
  }, [router]);

  function handleSelect(faction: Faction) {
    setFaction(faction);
    router.push('/play');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-sm" style={{ color: 'var(--ink-dim)' }}>불러오는 중...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--danger)' }}>시즌을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-5 py-10 max-w-lg mx-auto" style={{ background: 'var(--bg)' }}>
      {/* 헤더 */}
      <div className="mb-8 rise" style={{ animationDelay: '0ms' }}>
        <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--ink-dim)' }}>
          DIVERGE · 시즌 1 · {game.totalDays}일
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
          {game.season.title}
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          {game.season.diversion_point}
        </p>
      </div>

      {/* 구분선 */}
      <div className="mb-6 border-t" style={{ borderColor: 'var(--line)' }} />

      {/* 설명 */}
      <p className="text-sm mb-6 rise" style={{ color: 'var(--ink-soft)', animationDelay: '100ms' }}>
        두 진영 중 하나를 선택하세요. 매일 AI가 생성한 뉴스를 읽고 결정에 투표합니다.
        30일 후 AI 역사학자가 어느 세계가 더 나았는지 판정합니다.
      </p>

      {/* 진영 카드 */}
      <div className="flex flex-col gap-4 rise" style={{ animationDelay: '200ms' }}>
        <FactionCard season={game.season} faction="A" onSelect={handleSelect} />
        <FactionCard season={game.season} faction="B" onSelect={handleSelect} />
      </div>

      {/* 참여자 수 힌트 */}
      <p className="text-center text-xs mt-8" style={{ color: 'var(--ink-dim)' }}>
        오늘 {game.dayNumber}일차 진행 중
      </p>
    </main>
  );
}
