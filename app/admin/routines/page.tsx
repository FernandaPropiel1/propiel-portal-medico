import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export default async function AdminRoutinesPage() {
  const supabase = createClient();
  const { data: routines } = await supabase.from('routines').select('*, routine_items(count)').order('sort_order', { ascending: true });
  return (
    <div className="page-container">
      <div className="admin-actions"><h1 style={{ fontSize: 22 }}>Rutinas prearmadas</h1><Link href="/admin/routines/new" className="btn-primary">+ Nueva rutina</Link></div>
      <table className="admin-table"><thead><tr><th>Título</th><th>Audiencia</th><th>Productos</th><th></th></tr></thead>
        <tbody>{(routines ?? []).map((r) => (<tr key={r.id}><td>{r.title}</td><td>{r.audience}</td><td>{r.routine_items?.[0]?.count ?? 0}</td><td><Link href={`/admin/routines/${r.id}`} className="admin-product-link">Editar</Link></td></tr>))}</tbody>
      </table>
      {(!routines || routines.length === 0) && <p className="results-placeholder">Todavía no hay rutinas creadas.</p>}
    </div>
  );
}
