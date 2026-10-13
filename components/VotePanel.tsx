'use client';
import type { DailyDecision, Choice } from '@/lib/types';

interface Props {
  decision: DailyDecision;
  myChoice: Choice | null;
  counts: { X: number; Y: number };
  factionColor: string;
  onVote: (decisionId: string, choice: Choice) => void;
}

export default function VotePanel({ decision, myChoice, counts, factionColor, onVote }: Props) {
  const total = counts.X + counts.Y;

  return (
    <div className="p-5 rounded-[var(--r-card)]" style={{ background: 'var(--card)', border: `1.5px solid ${factionColor}30` }}>
      <div className="text-xs font-semibold mb-3" style={{ color: 'var(--ink-dim)' }}>오늘의 결정</div>
      <p className="font-semibold mb-4 leading-snug" style={{ color: 'var(--ink)' }}>
        {decision.question}
      </p>

      {!myChoice ? (
        <div className="flex flex-col gap-2">
          {(['X', 'Y'] as Choice[]).map(choice => (
            <button
              key={choice}
              onClick={() => onVote(decision.id, choice)}
              className="w-full py-3 rounded-full text-sm font-semibold transition-all"
              style={{
                background: choice === 'X' ? factionColor : 'transparent',
                color: choice === 'X' ? 'var(--on-dark)' : 'var(--ink)',
                border: `1.5px solid ${factionColor}`,
              }}
            >
              {choice === 'X' ? decision.option_x : decision.option_y}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {(['X', 'Y'] as Choice[]).map(choice => {
            const count = counts[choice];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isMyChoice = choice === myChoice;
            return (
              <div key={choice} className="relative overflow-hidden rounded-full py-3 px-4" style={{ background: 'var(--line)' }}>
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700"
                  style={{ width: `${pct}%`, background: isMyChoice ? factionColor : `${factionColor}50` }}
                />
                <div className="relative flex justify-between text-sm">
                  <span style={{ color: isMyChoice ? 'var(--on-dark)' : 'var(--ink)', fontWeight: isMyChoice ? 600 : 400 }}>
                    {choice === 'X' ? decision.option_x : decision.option_y}
                    {isMyChoice && ' ✓'}
                  </span>
                  <span style={{ color: 'var(--ink-soft)' }}>{pct}%</span>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-center mt-1" style={{ color: 'var(--ink-dim)' }}>
            총 {total}명 투표
          </p>
        </div>
      )}
    </div>
  );
}
