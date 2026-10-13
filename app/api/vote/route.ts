import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import type { Choice } from '@/lib/types';

export async function POST(req: NextRequest) {
  const body = await req.json() as { userId: string; decisionId: string; choice: Choice };
  const { userId, decisionId, choice } = body;

  if (!userId || !decisionId || !['X', 'Y'].includes(choice)) {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const db = supabaseServer();

  const { error } = await db.from('votes').upsert(
    { user_id: userId, decision_id: decisionId, choice },
    { onConflict: 'user_id,decision_id' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 투표 집계 반환
  const { data: counts } = await db
    .from('votes')
    .select('choice')
    .eq('decision_id', decisionId);

  const X = counts?.filter((v: { choice: Choice }) => v.choice === 'X').length ?? 0;
  const Y = counts?.filter((v: { choice: Choice }) => v.choice === 'Y').length ?? 0;

  return NextResponse.json({ ok: true, counts: { X, Y } });
}
