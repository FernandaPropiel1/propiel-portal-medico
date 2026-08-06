import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateSellerSaleRecord, deleteSellerSaleRecord } from '../../actions';
export const dynamic = 'force-dynamic';
export default async function EditSellerSaleRecordPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: record } = await supabase
    .from('seller_sale_records')
    .select('*, sellers(full_name, branch), doctors(full_name), ambassadors(full_name)')
    .eq('id', params.id)
    .maybeSingle();
  if (!record) redirect('/admin/seller-sales');

  const boundUpdate = updateSellerSaleRecord.bind(null, record.id);
  const boundDelete = deleteSellerSaleRecord.bind(null, record.id);
  const referidoLabel = record.doctors?.full_name ?? record.ambassadors?.full_name ?? '— venta directa, sin referido —';
  const referidoTipo = record.referred_doctor_id ? 'Médico' : record.referred_ambassador_id ? 'Embajadora' : null;

  return (
    <div className="page-container" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Editar folio</h1>
      <p className="admin-note" style={{ marginBottom: 20 }}>
        Vendedora: {record.sellers?.full_name}{record.sellers?.branch ? ` (${record.sellers.branch})` : ''} · Referido: {referidoLabel}
        {referidoTipo ? ` (${referidoTipo})` : ''}
      </p>

      <form action={boundUpdate} className="admin-form">
        <label>Folio de Microsip<input name="folio" defaultValue={record.folio} required /></label>
        <label>Fecha<input name="sale_date" type="date" defaultValue={record.sale_date} /></label>
        <label>Nota<input name="note" defaultValue={record.note ?? ''} /></label>

        {record.referred_doctor_id && (
          <>
            <label>Monto de la venta<input name="amount" type="number" step="0.01" defaultValue={record.amount ?? ''} /></label>
            <label>
              Comisión aplicable
              <select name="commission_pct" defaultValue={record.commission_pct != null ? String(record.commission_pct) : ''}>
                <option value="">— selecciona —</option>
                <option value="10">10% (marca exclusiva)</option>
                <option value="5">5% (marca general)</option>
              </select>
            </label>
          </>
        )}

        <button type="submit" className="btn-primary">Guardar cambios</button>
      </form>

      <form action={boundDelete} style={{ marginTop: 20 }}>
        <button type="submit" className="btn-danger">Borrar folio</button>
      </form>
    </div>
  );
}
