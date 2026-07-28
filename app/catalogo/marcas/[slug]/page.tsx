import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/app/components/PortalNav';

export const dynamic = 'force-dynamic';

export default async function BrandPage({ params }: { params: { slug: string } }) {
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

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!brand) notFound();

  const { data: items } = await supabase
    .from('doctor_catalog_items')
    .select('*, products(*)')
    .eq('doctor_id', doctor.id)
    .eq('products.brand_slug', params.slug);

  const filtered = (items ?? []).filter((it: any) => it.products);

  return (
    <div>
      <PortalNav doctorName={doctor.full_name} isAdmin={!!adminRow} />
      <div className="page-container">
        <Link href="/catalogo" className="back-link">Volver al catálogo</Link>
        <div className="brand-hero">
          <h1>{brand.name}</h1>
          {brand.tagline && <div className="brand-tagline">{brand.tagline}</div>}
          {brand.description && <p className="brand-description">{brand.description}</p>}
        </div>
        <div className="product-grid">
          {filtered.map((it: any) => (
            <Link key={it.id} href={`/catalogo/${it.products.id}`} className="product-card">
              {it.products.image_url && (
                <Image src={it.products.image_url} alt={it.products.title} width={300} height={300} unoptimized />
              )}
              <div className="product-card-info">
                <div className="product-card-title">{it.products.title}</div>
                {it.products.price != null && (
                  <div className="product-card-price">
                    ${Number(it.products.price).toLocaleString('es-MX')} {it.products.currency ?? 'MXN'}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
