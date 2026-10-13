import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 브라우저용 (읽기 전용 작업)
export const supabaseBrowser = () => createClient(url, anon);

// 서버용 (API route에서 사용 — service role)
export const supabaseServer = () => createClient(url, service);
