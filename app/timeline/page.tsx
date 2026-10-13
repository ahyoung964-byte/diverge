'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TimelineItem from '@/components/TimelineItem';
import type { Season } from '@/lib/types';
import type { TimelineDay } from '@/app/api/timeline/route';

export default function TimelinePage() {
  const router = useRouter();
  const [days, setDays] = useState<TimelineDay[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/timeline')
      .then(r => r.json())
      .then(data => { setDays(data.days); setSeason(data.season); })
      .finally(() => setLoading(false));
  }, []);

  function handleShare() {
    const text = `Diverge — ${season?.title}\n${days.map(d => `Day ${d.dayNumber}: ${d.newsA?.headline ?? ''}`).join('\n')}\nhttps://diverge-game.vercel.app`;
    if (navigator.share) navigator.share({ text });
    else navigator.clipboard?.writeText(text);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>불러오는 중...</p>
    </div>
  );

  return (
    <main className="min-h-screen pb-24 px-5 pt-8 max-w-lg mx-auto" style={{ background: 'var(--bg)' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'var(--ink-dim)' }}>DIVERGE · 타임라인</div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{season?.title}</h1>
        </div>
        <button onClick={handleShare} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--brand)', color: 'var(--on-dark)' }}>
          공유
        </button>
      </div>

      {days.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>아직 기록이 없습니다.</p>
      ) : (
        days.map(d => (
          <TimelineItem
            key={d.dayNumber}
            dayNumber={d.dayNumber}
            newsA={d.newsA}
            newsB={d.newsB}
            worldStateA={d.worldStateA}
            worldStateB={d.worldStateB}
            colorA={season?.faction_a_color ?? '#4A90D9'}
            colorB={season?.faction_b_color ?? '#E8823A'}
          />
        ))
      )}

      <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-4 px-5 max-w-lg mx-auto" style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
        <button onClick={() => router.push('/play')} className="text-xs" style={{ color: 'var(--ink-soft)' }}>오늘</button>
        <button onClick={() => router.push('/timeline')} className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>타임라인</button>
        <button onClick={() => router.push('/verdict')} className="text-xs" style={{ color: 'var(--ink-soft)' }}>판정</button>
      </nav>
    </main>
  );
}
