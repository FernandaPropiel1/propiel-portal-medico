import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export default async function AdminSellersPage() {
  const supabase = createClient();
  const { data: sellers } = await supabase.from('sellers').select('*').order('full_name', { ascending: true });
  return (
    <div className="page-container">
      <div className="admin-actions"><h1 style={{ fontSize: 22 }}>Vendedoras</h1><Link href="/admin/sellers/new" className="btn-primary">+ Nueva vendedora</Link></div>
      <table className="admin-table"><thead><tr><th>Nombre</th><th>Sucursal</th><th>Ciudad</th><th>Estatus</th><th></th></tr></thead>
        <tbody>{(sellers ?? []).map((s: any) => (<tr key={s.id}><td>{s.full_name}</td><td>{s.branch ?? '—'}</td><td>{s.city === 'MTY' ? 'Monterrey' : s.city === 'Torreón' ? 'Torreón' : '—'}</td><td><span className={`admin-status-pill ${s.status === 'pending_access' ? 'pending' : s.status === 'paused' ? 'paused' : ''}`}>{s.status}</span></td><td><Link href={`/admin/sellers/${s.id}`} className="admin-product-link">Editar</Link></td></tr>))}</tbody>
      </table>
    </div>
  );
}
