import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { confirmDoctorReferralAmount } from '../actions';
export const dynamic = 'force-dynamic';
export default async function AdminSellerSalesPage() {
  const supabase = createClient();
  const { data: records } = await supabase
    .from('seller_sale_records')
    .select('*, sellers(full_name, branch), doctors(full_name), ambassadors(full_name)')
    .order('sale_date', { ascending: false });

  const pendingDoctorRecords = (records ?? []).filter((r: any) => r.referred_doctor_id && !r.synced_to_doctor_sales);
  const otherRecords = (records ?? []).filter((r: any) => !(r.referred_doctor_id && !r.synced_to_doctor_sales));

  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Ventas en tienda física (folio Microsip)</h1>
      <p className="admin-note" style={{ marginBottom: 20 }}>
        Registro que las vendedoras capturan al surtir una venta física con folio de Microsip. Para
        referidos de médico, la vendedora solo captura el folio — aquí abajo agregas el monto para
        que quede registrado en el panel del médico y puedas decidir si aplica 5% o 10% de comisión.
        Para embajadoras no hace falta nada: ya se contaron automáticamente en su nivel.
      </p>

      {pendingDoctorRecords.length > 0 && (
        <div className="panel-card">
          <h2>Pendientes de monto (referidos de médico)</h2>
          {pendingDoctorRecords.map((r: any) => {
            const boundConfirm = confirmDoctorReferralAmount.bind(null, r.id);
            return (
              <form action={boundConfirm} key={r.id} className="admin-form" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 14, margin: 0 }}>
                  <strong>{r.doctors?.full_name}</strong> · folio {r.folio} · {new Date(r.sale_date).toLocaleDateString('es-MX')} ·
                  vendedora {r.sellers?.full_name}{r.sellers?.branch ? ` (${r.sellers.branch})` : ''}
                </p>
                <label>Monto de la venta<input name="amount" type="number" step="0.01" required /></label>
                <label>
                  Comisión aplicable
                  <select name="commission_pct" defaultValue="">
                    <option value="">— selecciona —</option>
                    <option value="10">10% (marca exclusiva)</option>
                    <option value="5">5% (marca general)</option>
                  </select>
                </label>
                <button type="submit" className="btn-primary">Confirmar y registrar</button>
                <Link href={`/admin/seller-sales/${r.id}`} className="admin-product-link">Editar / borrar folio</Link>
              </form>
            );
          })}
        </div>
      )}

      <div className="panel-card">
        <h2>Historial</h2>
        {otherRecords.length === 0 ? (
          <p className="results-placeholder">Todavía no hay folios confirmados.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Fecha</th><th>Folio</th><th>Vendedora</th><th>Referido</th><th>Monto</th><th>Comisión</th><th></th></tr>
            </thead>
            <tbody>
              {otherRecords.map((r: any) => (
                <tr key={r.id}>
                  <td>{new Date(r.sale_date).toLocaleDateString('es-MX')}</td>
                  <td>{r.folio}</td>
                  <td>{r.sellers?.full_name ?? '—'}</td>
                  <td>{r.doctors?.full_name ?? r.ambassadors?.full_name ?? '— directa —'}</td>
                  <td>{r.amount != null ? `$${Number(r.amount).toLocaleString('es-MX')}` : '—'}</td>
                  <td>{r.commission_pct != null ? `${r.commission_pct}%` : '—'}</td>
                  <td><Link href={`/admin/seller-sales/${r.id}`} className="admin-product-link">Editar / borrar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
