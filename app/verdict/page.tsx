'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Verdict } from '@/lib/types';
import { getFaction } from '@/lib/storage';

export default function VerdictPage() {
  const router = useRouter();
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [locked, setLocked] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const faction = getFaction();

  useEffect(() => {
    fetch('/api/verdict')
      .then(r => r.json())
      .then(data => {
        if (data.locked) { setLocked(true); setRemaining(data.remainingDays); }
        else setVerdict(data.verdict);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>불러오는 중...</p>
    </div>
  );

  return (
    <main className="min-h-screen pb-24 px-5 pt-8 max-w-lg mx-auto" style={{ background: 'var(--bg)' }}>
      <div className="mb-6">
        <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'var(--ink-dim)' }}>DIVERGE · 역사학자의 판정</div>
        <h1 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>최후 판정</h1>
      </div>

      {locked ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 num" style={{ color: 'var(--ink)' }}>{remaining}</div>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>일 후 판정이 내려집니다</p>
          <p className="text-xs mt-2" style={{ color: 'var(--ink-dim)' }}>계속 투표에 참여해 역사를 만들어가세요</p>
        </div>
      ) : verdict ? (
        <div className="fade-up">
          <div
            className="text-center py-4 rounded-[var(--r-card)] mb-6 font-bold text-xl"
            style={{
              background: verdict.winner === 'A' ? '#4A90D9' : verdict.winner === 'B' ? '#E8823A' : 'var(--ink)',
              color: 'var(--on-dark)',
            }}
          >
            {verdict.winner === 'tie' ? '무승부' : verdict.winner === faction ? '당신의 진영이 이겼습니다' : '상대 진영이 이겼습니다'}
          </div>
          <div className="p-5 rounded-[var(--r-card)]" style={{ background: 'var(--card)' }}>
            <div className="text-xs font-semibold mb-3" style={{ color: 'var(--ink-dim)' }}>역사학자의 판정문</div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{verdict.content}</p>
          </div>
          <button
            onClick={() => {
              const text = `Diverge 판정: ${verdict.winner === 'tie' ? '무승부' : verdict.winner + '파 승리'}\n${verdict.content.slice(0, 100)}...\nhttps://diverge-game.vercel.app`;
              if (navigator.share) navigator.share({ text });
              else navigator.clipboard?.writeText(text);
            }}
            className="w-full mt-4 py-3 rounded-full font-semibold text-sm"
            style={{ background: 'var(--brand)', color: 'var(--on-dark)' }}
          >
            결과 공유하기
          </button>
        </div>
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-4 px-5 max-w-lg mx-auto" style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
        <button onClick={() => router.push('/play')} className="text-xs" style={{ color: 'var(--ink-soft)' }}>오늘</button>
        <button onClick={() => router.push('/timeline')} className="text-xs" style={{ color: 'var(--ink-soft)' }}>타임라인</button>
        <button onClick={() => router.push('/verdict')} className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>판정</button>
      </nav>
    </main>
  );
}
