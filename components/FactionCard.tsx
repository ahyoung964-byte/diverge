'use client';
import type { Season, Faction } from '@/lib/types';

interface Props {
  season: Season;
  faction: Faction;
  onSelect: (faction: Faction) => void;
}

export default function FactionCard({ season, faction, onSelect }: Props) {
  const isA = faction === 'A';
  const name = isA ? season.faction_a_name : season.faction_b_name;
  const desc = isA ? season.faction_a_desc : season.faction_b_desc;
  const color = isA ? season.faction_a_color : season.faction_b_color;

  return (
    <button
      onClick={() => onSelect(faction)}
      style={{ borderColor: color }}
      className="w-full text-left p-5 rounded-[var(--r-card)] border-2 bg-[var(--card)] transition-all active:scale-95"
    >
      <div className="font-bold text-lg mb-1" style={{ color }}>{name}</div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{desc}</p>
      <div
        className="mt-4 py-2 rounded-full text-center text-sm font-semibold"
        style={{ background: color, color: 'var(--on-dark)' }}
      >
        이 진영으로 참전하기
      </div>
    </button>
  );
}
