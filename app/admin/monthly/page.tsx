import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { setCurrentMonthlyFeature } from '../actions';
export const dynamic = 'force-dynamic';
export default async function AdminMonthlyPage() {
  const supabase = createClient();
  const { data: features } = await supabase.from('seller_monthly_feature').select('*').order('created_at', { ascending: false });
  return (
    <div className="page-container">
      <div className="admin-actions"><h1 style={{ fontSize: 22 }}>Del mes (vendedoras)</h1><Link href="/admin/monthly/new" className="btn-primary">+ Nuevo mes</Link></div>
      <table className="admin-table"><thead><tr><th>Mes</th><th>Concepto</th><th>Estatus</th><th></th><th></th></tr></thead>
        <tbody>{(features ?? []).map((f) => { const boundSetCurrent = setCurrentMonthlyFeature.bind(null, f.id); return (
          <tr key={f.id}><td>{f.month_label}</td><td>{f.concept_title}</td><td>{f.is_current ? <span className="admin-status-pill">Activo</span> : <span className="admin-status-pill paused">Inactivo</span>}</td><td>{!f.is_current && (<form action={boundSetCurrent}><button type="submit" className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Marcar como actual</button></form>)}</td><td><Link href={`/admin/monthly/${f.id}`} className="admin-product-link">Editar</Link></td></tr>
        ); })}</tbody>
      </table>
      {(!features || features.length === 0) && <p className="results-placeholder">Todavía no hay ningún mes armado.</p>}
    </div>
  );
}
