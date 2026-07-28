import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/app/components/PortalNav';
import { getSiteCopy } from '@/lib/siteCopy';
import VendedoraPanelClient from './VendedoraPanelClient';

export const dynamic = 'force-dynamic';

const NAV_ITEMS = [{ href: '/vendedora/panel', label: 'Mi panel' }];

export default async function VendedoraPanelPage() {
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

  const { data: promoted } = await supabase
    .from('seller_promoted_products')
    .select('*, products(*)')
    .order('sort_order', { ascending: true });

  const { data: brands } = await supabase.from('brands').select('*').order('name');

  const { data: trainingMaterials } = await supabase
    .from('training_materials')
    .select('*')
    .in('audience', ['sellers', 'all'])
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const { data: allProducts } = await supabase
    .from('products')
    .select('id, title, vendor, price, currency, image_url, needs, key_ingredients, highlight_ingredient, highlight_benefit, available_cities')
    .order('title', { ascending: true });

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, full_name, referral_code, has_isotretinoin_access')
    .order('full_name');

  const { data: ambassadorsRaw } = await supabase
    .from('ambassadors')
    .select('id, full_name, referral_code, ambassador_sales(count)')
    .order('full_name');
  const ambassadors = (ambassadorsRaw ?? []).map((a: any) => ({
    id: a.id,
    full_name: a.full_name,
    referral_code: a.referral_code,
    referral_count: a.ambassador_sales?.[0]?.count ?? 0,
  }));

  const { data: saleRecords } = await supabase
    .from('seller_sale_records')
    .select('id, folio, sale_date, note, doctors(full_name), ambassadors(full_name)')
    .eq('seller_id', seller.id)
    .order('sale_date', { ascending: false })
    .limit(10);

  const { data: currentFeatureRaw } = await supabase
    .from('seller_monthly_feature')
    .select('*, routines(*, routine_items(*, products(*)))')
    .eq('is_current', true)
    .maybeSingle();

  let duos: any[] = [];
  let promotions: any[] = [];
  if (currentFeatureRaw) {
    const { data: duosData } = await supabase
      .from('seller_monthly_duos')
      .select('*, product_a:product_a_id(id, title, image_url), product_b:product_b_id(id, title, image_url)')
      .eq('feature_id', currentFeatureRaw.id)
      .order('sort_order', { ascending: true });
    duos = duosData ?? [];

    const { data: promosData } = await supabase
      .from('seller_monthly_promotions')
      .select('*')
      .eq('feature_id', currentFeatureRaw.id)
      .order('sort_order', { ascending: true });
    promotions = promosData ?? [];
  }

  const copy = await getSiteCopy(supabase);

  return (
    <div>
      <PortalNav doctorName={seller.full_name} isAdmin={!!adminRow} navItems={NAV_ITEMS} />
      <div className="page-header">
        <h1>Mi panel</h1>
        <p>
          {seller.full_name}
          {seller.branch ? ` · ${seller.branch}` : ''}
          {seller.city ? ` · ${seller.city === 'MTY' ? 'Monterrey' : seller.city}` : ''}
        </p>
      </div>
      <div className="page-container">
        <VendedoraPanelClient
          sellerId={seller.id}
          sellerCity={seller.city}
          promoted={promoted ?? []}
          allProducts={allProducts ?? []}
          materials={trainingMaterials ?? []}
          brands={brands ?? []}
          doctors={doctors ?? []}
          ambassadors={ambassadors}
          saleRecords={saleRecords ?? []}
          monthlyFeature={currentFeatureRaw ?? null}
          duos={duos}
          promotions={promotions}
          copy={copy}
        />

        <div className="panel-card">
          <h2>Ventas y metas</h2>
          <p className="results-placeholder">
            El registro de ventas y metas por sucursal vive en el sistema de metas de Propiel.
          </p>
          <Link href="https://propiel-metas.vercel.app" target="_blank" className="btn-primary" style={{ textDecoration: 'none' }}>
            Ver mis metas y ventas →
          </Link>
        </div>
      </div>
    </div>
  );
}
