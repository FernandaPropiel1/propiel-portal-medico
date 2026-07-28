import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase.from('products').select('id, title, vendor, price, currency, step_label, brand_slug').order('title', { ascending: true });
  return (
    <div className="page-container">
      <div className="admin-actions"><h1 style={{ fontSize: 22 }}>Productos ({products?.length ?? 0})</h1><Link href="/admin/products/new" className="btn-primary">+ Agregar producto</Link></div>
      <table className="admin-table"><thead><tr><th>Título</th><th>Marca</th><th>Precio</th><th>Categoría</th><th>Marca exclusiva</th><th></th></tr></thead>
        <tbody>{(products ?? []).map((p: any) => (<tr key={p.id}><td>{p.title}</td><td>{p.vendor}</td><td>{p.price != null ? `$${Number(p.price).toLocaleString('es-MX')} ${p.currency ?? ''}` : '—'}</td><td>{p.step_label ?? '—'}</td><td>{p.brand_slug ?? '—'}</td><td><Link href={`/admin/products/${p.id}`} className="admin-product-link">Editar</Link></td></tr>))}</tbody>
      </table>
    </div>
  );
}
