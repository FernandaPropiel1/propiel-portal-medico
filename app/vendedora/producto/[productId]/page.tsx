import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/app/components/PortalNav';

export const dynamic = 'force-dynamic';

const NAV_ITEMS = [{ href: '/vendedora/panel', label: 'Mi panel' }];

export default async function VendedoraProductDetailPage({ params }: { params: { productId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: seller } = await supabase
    .from('sellers')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();
  if (!seller) redirect('/login');

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

  let brand = null;
  if (product.brand_slug) {
    const { data } = await supabase
      .from('brands')
      .select('slug, name')
      .eq('slug', product.brand_slug)
      .maybeSingle();
    brand = data;
  }

  const stockCities: string[] = product.stock_cities ?? [];
  const inStock = seller.city ? stockCities.includes(seller.city) : stockCities.length > 0;
  const keyIngredients: { name: string; concentration: string | null }[] = product.key_ingredients ?? [];

  return (
    <div>
      <PortalNav doctorName={seller.full_name} isAdmin={!!adminRow} navItems={NAV_ITEMS} />
      <div className="page-container">
        <Link href="/vendedora/panel" className="back-link">Volver a mi panel</Link>
        <div className="product-detail">
          <div>
            {product.image_url && (
              <Image src={product.image_url} alt={product.title} width={400} height={400} unoptimized />
            )}
          </div>
          <div>
            <span className={`stock-badge ${inStock ? 'stock-badge-tienda' : 'stock-badge-pedir'}`} style={{ position: 'static', display: 'inline-block', marginBottom: 8 }}>
              {inStock ? 'En tienda' : 'Se puede pedir'}
            </span>
            <div className="product-detail-title">{product.title}</div>
            {product.vendor && <div className="product-detail-vendor">{product.vendor}</div>}
            {product.price != null && (
              <div className="product-detail-price">
                ${Number(product.price).toLocaleString('es-MX')} {product.currency ?? 'MXN'}
              </div>
            )}

            <dl>
              {product.highlight_skin_type && (
                <>
                  <dt>Tipo de piel</dt>
                  <dd>{product.highlight_skin_type}</dd>
                </>
              )}
              {product.highlight_benefit && (
                <>
                  <dt>Para qué sirve</dt>
                  <dd>{product.highlight_benefit}</dd>
                </>
              )}
              {product.highlight_ingredient && (
                <>
                  <dt>Ingrediente clave</dt>
                  <dd>{product.highlight_ingredient}</dd>
                </>
              )}
              {product.needs && product.needs.length > 0 && (
                <>
                  <dt>Necesidad</dt>
                  <dd>{product.needs.join(', ')}</dd>
                </>
              )}
              {keyIngredients.length > 0 && (
                <>
                  <dt>Ingredientes activos</dt>
                  <dd>{keyIngredients.map((k) => (k.concentration ? `${k.name} ${k.concentration}` : k.name)).join(', ')}</dd>
                </>
              )}
              {!inStock && (
                <>
                  <dt>Disponibilidad</dt>
                  <dd>No hay existencia en tu sucursal ahora mismo, pero se puede pedir para tu cliente.</dd>
                </>
              )}
            </dl>

            {(product.usage_instructions || product.ingredients_full || product.pairs_well_with || product.avoid_combining_with) && (
              <div className="product-extended">
                {product.usage_instructions && (
                  <div className="extended-block">
                    <div className="extended-block-title">Modo de uso</div>
                    <div className="extended-block-body">{product.usage_instructions}</div>
                  </div>
                )}
                {product.pairs_well_with && (
                  <div className="extended-block extended-block-positive">
                    <div className="extended-block-title">Combina bien con</div>
                    <div className="extended-block-body">{product.pairs_well_with}</div>
                  </div>
                )}
                {product.avoid_combining_with && (
                  <div className="extended-block extended-block-caution">
                    <div className="extended-block-title">Evitar combinar con</div>
                    <div className="extended-block-body">{product.avoid_combining_with}</div>
                  </div>
                )}
                {product.ingredients_full && (
                  <div className="extended-block">
                    <div className="extended-block-title">Ingredientes</div>
                    <div className="extended-block-body">{product.ingredients_full}</div>
                  </div>
                )}
              </div>
            )}

            {brand && (
              <Link href={`/catalogo/marcas/${brand.slug}`} className="badge-exclusive-link">
                Marca Exclusiva · Conoce {brand.name} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
