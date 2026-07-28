import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateDoctor, logSale } from '../../actions';
import CatalogEditor from './CatalogEditor';
export const dynamic = 'force-dynamic';
export default async function EditDoctorPage({ params }) {
  const supabase = createClient();
  const { data: doctor } = await supabase.from('doctors').select('*').eq('id', params.id).maybeSingle();
  if (!doctor) notFound();
  const { data: products } = await supabase.from('products').select('*').order('step_order', { ascending: true }).order('title', { ascending: true });
  const { data: catalogItems } = await supabase.from('doctor_catalog_items').select('*').eq('doctor_id', doctor.id);
  const { data: sales } = await supabase.from('doctor_sales').select('*, products(title)').eq('doctor_id', doctor.id).order('sale_date', { ascending: false });
  const total = (sales ?? []).reduce((sum, s) => sum + Number(s.amount), 0);
  const boundUpdate = updateDoctor.bind(null, doctor.id);
  const boundLogSale = logSale.bind(null, doctor.id);
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>{doctor.full_name}</h1>
      {doctor.status === 'pending_access' && (<div className="admin-callout">Este médico todavía no tiene acceso activado.</div>)}
      <div className="panel-card">
        <h2>Perfil</h2>
        <form action={boundUpdate} className="admin-form">
          <label>Nombre completo<input name="full_name" defaultValue={doctor.full_name} required /></label>
          <label>Especialidad<input name="specialty" defaultValue={doctor.specialty ?? ''} /></label>
          <label>Ciudad<input name="city" defaultValue={doctor.city ?? ''} /></label>
          <label>Clínica / consultorio<input name="clinic_name" defaultValue={doctor.clinic_name ?? ''} /></label>
          <label>Código de referido<input name="referral_code" defaultValue={doctor.referral_code} required /></label>
          <label>Correo<input name="email" type="email" defaultValue={doctor.email} required /></label>
          <label>Estatus<select name="status" defaultValue={doctor.status}><option value="active">active</option><option value="pending_access">pending_access</option><option value="paused">paused</option></select></label>
          <label className="admin-checkbox-label"><input type="checkbox" name="has_isotretinoin_access" defaultChecked={doctor.has_isotretinoin_access} />Tiene acceso a Isotretinoína</label>
          <button type="submit" className="btn-primary">Guardar cambios</button>
        </form>
      </div>
      <div className="panel-card">
        <h2>Ventas ligadas a este médico</h2>
        <form action={boundLogSale} className="admin-form" style={{ marginBottom: 20 }}>
          <label>Producto (opcional)<select name="product_id" defaultValue=""><option value="">— sin producto específico —</option>{(products ?? []).map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}</select></label>
          <label>Monto<input name="amount" type="number" step="0.01" required /></label>
          <label>Fecha<input name="sale_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          <label>Nota<input name="note" /></label>
          <button type="submit" className="btn-primary">Registrar venta</button>
        </form>
        {sales && sales.length > 0 ? (
          <>
            <table className="sales-table"><thead><tr><th>Fecha</th><th>Producto</th><th>Monto</th><th>Nota</th></tr></thead>
              <tbody>{sales.map((s) => (<tr key={s.id}><td>{new Date(s.sale_date).toLocaleDateString('es-MX')}</td><td>{s.products?.title ?? '—'}</td><td>${Number(s.amount).toLocaleString('es-MX')}</td><td>{s.note ?? ''}</td></tr>))}</tbody>
            </table>
            <div className="sales-total-row"><span>Total</span><span>${total.toLocaleString('es-MX')}</span></div>
          </>
        ) : (<p className="results-placeholder">Sin ventas registradas todavía.</p>)}
      </div>
      <div className="panel-card"><h2>Catálogo</h2><CatalogEditor doctorId={doctor.id} products={products ?? []} catalogItems={catalogItems ?? []} /></div>
    </div>
  );
}
