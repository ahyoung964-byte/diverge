import type { NewsArticle, WorldState } from '@/lib/types';

interface Props {
  dayNumber: number;
  newsA: NewsArticle | null;
  newsB: NewsArticle | null;
  worldStateA: WorldState | null;
  worldStateB: WorldState | null;
  colorA: string;
  colorB: string;
}

export default function TimelineItem({ dayNumber, newsA, newsB, worldStateA, worldStateB, colorA, colorB }: Props) {
  return (
    <div className="py-4 border-b" style={{ borderColor: 'var(--line)' }}>
      <div className="text-xs mb-2 font-semibold" style={{ color: 'var(--ink-dim)' }}>
        Day {dayNumber}
      </div>
      <div className="flex flex-col gap-2">
        {newsA && (
          <div className="flex gap-2 items-start">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: colorA }} />
            <p className="text-sm" style={{ color: 'var(--ink)' }}>{newsA.headline}</p>
          </div>
        )}
        {newsB && (
          <div className="flex gap-2 items-start">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: colorB }} />
            <p className="text-sm" style={{ color: 'var(--ink)' }}>{newsB.headline}</p>
          </div>
        )}
      </div>
      {(worldStateA || worldStateB) && (
        <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--ink-dim)' }}>
          {worldStateA && <span style={{ color: colorA }}>A 민심 {worldStateA.morale}</span>}
          {worldStateB && <span style={{ color: colorB }}>B 민심 {worldStateB.morale}</span>}
        </div>
      )}
    </div>
  );
}
