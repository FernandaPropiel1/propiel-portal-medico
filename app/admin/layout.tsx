import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/app/components/PortalNav';
import AdminNav from './AdminNav';
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: adminRow } = await supabase.from('admin_users').select('*').eq('email', user.email).maybeSingle();
  if (!adminRow) redirect('/catalogo');
  return (<div><PortalNav doctorName={adminRow.full_name} isAdmin /><AdminNav />{children}</div>);
}
