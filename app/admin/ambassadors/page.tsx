import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export default async function AdminAmbassadorsPage() {
  const supabase = createClient();
  const { data: ambassadors } = await supabase.from('ambassadors').select('*, ambassador_catalog_items(count), ambassador_sales(count)').order('full_name', { ascending: true });
  return (
    <div className="page-container">
      <div className="admin-actions"><h1 style={{ fontSize: 22 }}>Embajadoras</h1><Link href="/admin/ambassadors/new" className="btn-primary">+ Nueva embajadora</Link></div>
      <table className="admin-table"><thead><tr><th>Nombre</th><th>Instagram</th><th>Código</th><th>Nivel</th><th>Estatus</th><th>Productos</th><th></th></tr></thead>
        <tbody>{(ambassadors ?? []).map((a: any) => { const refCount = a.ambassador_sales?.[0]?.count ?? 0; const discount = refCount >= 40 ? 18 : 15; return (
          <tr key={a.id}><td>{a.full_name}</td><td>{a.instagram_handle ?? '—'}</td><td>{a.referral_code}</td><td>{discount}% ({refCount} ref.)</td><td><span className={`admin-status-pill ${a.status === 'pending_access' ? 'pending' : a.status === 'paused' ? 'paused' : ''}`}>{a.status}</span></td><td>{a.ambassador_catalog_items?.[0]?.count ?? 0}</td><td><Link href={`/admin/ambassadors/${a.id}`} className="admin-product-link">Editar</Link></td></tr>
        ); })}</tbody>
      </table>
    </div>
  );
}
