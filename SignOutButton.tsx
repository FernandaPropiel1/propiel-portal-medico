'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();
  async function handleSignOut() { await supabase.auth.signOut(); router.push('/login'); router.refresh(); }
  return (<button onClick={handleSignOut} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }}>Cerrar sesión</button>);
}
