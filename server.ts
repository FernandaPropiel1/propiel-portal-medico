import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
const SUPABASE_URL = 'https://bhuicxxirvgjtuvpmalq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodWljeHhpcnZnanR1dnBtYWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNTY3MzEsImV4cCI6MjA5ODkzMjczMX0.p_Pz1ujsKxJQ0DIPrPVWrZf5m1Ia01u9rEi0wM-r5dc';
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } });
}
