import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export default async function AdminDoctorsPage() {
  const supabase = createClient();
  const { data: doctors } = await supabase.from('doctors').select('*, doctor_catalog_items(count)').order('full_name', { ascending: true });
  return (
    <div className="page-container">
      <div className="admin-actions"><h1 style={{ fontSize: 22 }}>Médicos</h1><Link href="/admin/doctors/new" className="btn-primary">+ Nuevo médico</Link></div>
      <table className="admin-table">
        <thead><tr><th>Nombre</th><th>Especialidad</th><th>Ciudad</th><th>Código</th><th>Estatus</th><th>Productos</th><th></th></tr></thead>
        <tbody>{(doctors ?? []).map((d) => (<tr key={d.id}><td>{d.full_name}</td><td>{d.specialty}</td><td>{d.city}</td><td>{d.referral_code}</td><td><span className={`admin-status-pill ${d.status === 'pending_access' ? 'pending' : d.status === 'paused' ? 'paused' : ''}`}>{d.status}</span></td><td>{d.doctor_catalog_items?.[0]?.count ?? 0}</td><td><Link href={`/admin/doctors/${d.id}`} className="admin-product-link">Editar</Link></td></tr>))}</tbody>
      </table>
    </div>
  );
}
