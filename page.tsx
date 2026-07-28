import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveHomePath } from '@/lib/roles';
export default async function Home() {
  const supabase = createClient();
  const path = await resolveHomePath(supabase);
  redirect(path);
}
