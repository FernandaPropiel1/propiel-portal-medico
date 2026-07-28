import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/app/components/PortalNav';
import CatalogoClient from './CatalogoClient';

export const dynamic = 'force-dynamic';

export default async function CatalogoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  if (!doctor) redirect('/login');

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  const { data: items } = await supabase
    .from('doctor_catalog_items')
    .select('*, products(*)')
    .eq('doctor_id', doctor.id)
    .order('sort_order', { ascending: true });

  const { data: brands } = await supabase
    .from('brands')
    .select('slug, name, tagline');

  return (
    <div>
      <PortalNav doctorName={doctor.full_name} isAdmin={!!adminRow} />
      <div className="page-header">
        <h1>Catálogo</h1>
        <p>Productos disponibles para {doctor.full_name}</p>
      </div>
      <div className="page-container">
        <CatalogoClient items={items ?? []} brands={brands ?? []} />
      </div>
    </div>
  );
}
