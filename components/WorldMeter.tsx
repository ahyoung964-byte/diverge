'use client';

interface Props {
  label: string;
  morale: number;
  prosperity: number;
  conflict: number;
  color: string;
}

export default function WorldMeter({ label, morale, prosperity, conflict, color }: Props) {
  const bars = [
    { name: '민심', value: morale },
    { name: '번영', value: prosperity },
    { name: '갈등', value: conflict },
  ];

  return (
    <div className="p-4 rounded-[var(--r-card)]" style={{ background: 'var(--card)' }}>
      <div className="text-xs font-semibold mb-3" style={{ color }}>{label}</div>
      <div className="flex flex-col gap-2">
        {bars.map(bar => (
          <div key={bar.name}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--ink-soft)' }}>{bar.name}</span>
              <span style={{ color: 'var(--ink)' }}>{bar.value}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'var(--line)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${bar.value}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
