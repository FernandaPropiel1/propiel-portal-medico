import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/app/components/PortalNav';
import EmbajadoraCatalogClient from './EmbajadoraCatalogClient';

export const dynamic = 'force-dynamic';

const NAV_ITEMS = [
  { href: '/embajadora/catalogo', label: 'Catálogo' },
  { href: '/embajadora/panel', label: 'Mi panel' },
];

export default async function EmbajadoraCatalogoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: ambassador } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();
  if (!ambassador) redirect('/login');

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  const { data: items } = await supabase
    .from('ambassador_catalog_items')
    .select('*, products(*)')
    .eq('ambassador_id', ambassador.id)
    .order('sort_order', { ascending: true });

  const { data: routines } = await supabase
    .from('routines')
    .select('*, routine_items(*, products(*))')
    .in('audience', ['ambassador', 'all'])
    .order('sort_order', { ascending: true });

  return (
    <div>
      <PortalNav doctorName={ambassador.full_name} isAdmin={!!adminRow} navItems={NAV_ITEMS} />
      <div className="page-header">
        <h1>Catálogo</h1>
        <p>Productos para recomendar, {ambassador.full_name}</p>
      </div>
      <div className="page-container">
        <EmbajadoraCatalogClient items={items ?? []} routines={routines ?? []} />
      </div>
    </div>
  );
}
