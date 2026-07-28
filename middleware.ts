import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { resolveHomePath } from '@/lib/roles';
const SUPABASE_URL = 'https://bhuicxxirvgjtuvpmalq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodWljeHhpcnZnanR1dnBtYWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNTY3MzEsImV4cCI6MjA5ODkzMjczMX0.p_Pz1ujsKxJQ0DIPrPVWrZf5m1Ia01u9rEi0wM-r5dc';
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies: { getAll() { return request.cookies.getAll(); }, setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: { user } } = await supabase.auth.getUser();
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  if (!user && !isLoginPage) { const url = request.nextUrl.clone(); url.pathname = '/login'; return NextResponse.redirect(url); }
  if (user && isLoginPage) { const url = request.nextUrl.clone(); url.pathname = await resolveHomePath(supabase); return NextResponse.redirect(url); }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
