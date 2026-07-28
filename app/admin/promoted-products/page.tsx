import { createClient } from '@/lib/supabase/server';
import PromotedProductsEditor from './PromotedProductsEditor';
export const dynamic = 'force-dynamic';
export default async function PromotedProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase.from('products').select('id, title, vendor').order('title', { ascending: true });
  const { data: promoted } = await supabase.from('seller_promoted_products').select('product_id, note');
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Productos a promover (vendedoras)</h1>
      <PromotedProductsEditor products={products ?? []} promoted={promoted ?? []} />
    </div>
  );
}
