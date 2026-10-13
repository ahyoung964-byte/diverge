'use client';
import type { NewsArticle } from '@/lib/types';

interface Props {
  article: NewsArticle;
  factionColor: string;
  factionName: string;
}

export default function NewsCard({ article, factionColor, factionName }: Props) {
  return (
    <div className="p-5 rounded-[var(--r-card)] fade-up" style={{ background: 'var(--card)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: factionColor, color: 'var(--on-dark)' }}
        >
          {factionName}
        </div>
        <span className="text-xs" style={{ color: 'var(--ink-dim)' }}>오늘의 뉴스</span>
      </div>
      <h3 className="font-bold text-base mb-2 leading-snug" style={{ color: 'var(--ink)' }}>
        {article.headline}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        {article.body}
      </p>
    </div>
  );
}
