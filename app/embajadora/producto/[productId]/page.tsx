import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/app/components/PortalNav';

export const dynamic = 'force-dynamic';

const NAV_ITEMS = [
  { href: '/embajadora/catalogo', label: 'Catálogo' },
  { href: '/embajadora/panel', label: 'Mi panel' },
];

export default async function EmbajadoraProductPage({ params }: { params: { productId: string } }) {
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

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.productId)
    .maybeSingle();
  if (!product) notFound();

  return (
    <div>
      <PortalNav doctorName={ambassador.full_name} isAdmin={!!adminRow} navItems={NAV_ITEMS} />
      <div className="page-container">
        <Link href="/embajadora/catalogo" className="back-link">Volver al catálogo</Link>
        <div className="product-detail">
          <div>
            {product.image_url && <Image src={product.image_url} alt={product.title} width={400} height={400} unoptimized />}
          </div>
          <div>
            <div className="product-detail-title">{product.title}</div>
            {product.vendor && <div className="product-detail-vendor">{product.vendor}</div>}
            {product.price != null && (
              <div className="product-detail-price">${Number(product.price).toLocaleString('es-MX')} {product.currency ?? 'MXN'}</div>
            )}
            {product.highlight_benefit && (
              <div className="extended-block" style={{ marginBottom: 16 }}>
                <div className="extended-block-title">Para qué sirve</div>
                <div className="extended-block-body">{product.highlight_benefit}</div>
              </div>
            )}
            {product.usage_instructions && (
              <div className="extended-block">
                <div className="extended-block-title">Modo de uso</div>
                <div className="extended-block-body">{product.usage_instructions}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
