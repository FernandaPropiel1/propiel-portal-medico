import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateAmbassador, logAmbassadorSale } from '../../actions';
import AmbassadorCatalogEditor from './AmbassadorCatalogEditor';
import { getSiteCopy } from '@/lib/siteCopy';
export const dynamic = 'force-dynamic';
export default async function EditAmbassadorPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: ambassador } = await supabase.from('ambassadors').select('*').eq('id', params.id).maybeSingle();
  if (!ambassador) notFound();
  const { data: products } = await supabase.from('products').select('*').order('step_order', { ascending: true }).order('title', { ascending: true });
  const { data: catalogItems } = await supabase.from('ambassador_catalog_items').select('*').eq('ambassador_id', ambassador.id);
  const { data: sales } = await supabase.from('ambassador_sales').select('*, products(title)').eq('ambassador_id', ambassador.id).order('sale_date', { ascending: false });
  const total = (sales ?? []).reduce((sum, s: any) => sum + Number(s.amount), 0);
  const referralCount = sales?.length ?? 0;
  const currentDiscount = referralCount >= 40 ? 18 : 15;
  const copy = await getSiteCopy(supabase);
  const boundUpdate = updateAmbassador.bind(null, ambassador.id);
  const boundLogSale = logAmbassadorSale.bind(null, ambassador.id);
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>{ambassador.full_name}</h1>
      {ambassador.status === 'pending_access' && (<div className="admin-callout">Esta embajadora todavía no tiene acceso activado.</div>)}
      <div className="panel-card">
        <h2>Perfil</h2>
        <form action={boundUpdate} className="admin-form">
          <label>Nombre completo<input name="full_name" defaultValue={ambassador.full_name} required /></label>
          <label>Instagram<input name="instagram_handle" defaultValue={ambassador.instagram_handle ?? ''} placeholder="@usuario" /></label>
          <label>Código de referido<input name="referral_code" defaultValue={ambassador.referral_code} required /></label>
          <label>Correo<input name="email" type="email" defaultValue={ambassador.email} required /></label>
          <label>Estatus<select name="status" defaultValue={ambassador.status}><option value="active">active</option><option value="pending_access">pending_access</option><option value="paused">paused</option></select></label>
          <button type="submit" className="btn-primary">Guardar cambios</button>
        </form>
      </div>
      <div className="panel-card">
        <h2>Esquema de niveles (automático)</h2>
        <div className="commission-list">
          <div className="commission-row"><span>Nivel actual ({referralCount} referidos registrados)</span><span className="commission-value">{currentDiscount}%</span></div>
          <div className="commission-row"><span>Primeros 40 referidos</span><span className="commission-value">15%</span></div>
          <div className="commission-row"><span>De 40 en adelante</span><span className="commission-value">18%</span></div>
          <div className="commission-row"><span>Bono adicional arriba de 100 referidos</span><span className="commission-value">{copy.ambassador_bonus_note}</span></div>
        </div>
        <p className="admin-note">El bono de +100 se edita en <a href="/admin/copy" className="admin-product-link">Admin → Textos</a>.</p>
      </div>
      <div className="panel-card">
        <h2>Ventas ligadas a esta embajadora</h2>
        <form action={boundLogSale} className="admin-form" style={{ marginBottom: 20 }}>
          <label>Producto (opcional)<select name="product_id" defaultValue=""><option value="">— sin producto específico —</option>{(products ?? []).map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}</select></label>
          <label>Monto<input name="amount" type="number" step="0.01" required /></label>
          <label>Fecha<input name="sale_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          <label>Nota<input name="note" /></label>
          <button type="submit" className="btn-primary">Registrar venta</button>
        </form>
        {sales && sales.length > 0 ? (
          <>
            <table className="sales-table"><thead><tr><th>Fecha</th><th>Producto</th><th>Monto</th><th>Nota</th></tr></thead>
              <tbody>{sales.map((s: any) => (<tr key={s.id}><td>{new Date(s.sale_date).toLocaleDateString('es-MX')}</td><td>{s.products?.title ?? '—'}</td><td>${Number(s.amount).toLocaleString('es-MX')}</td><td>{s.note ?? ''}</td></tr>))}</tbody>
            </table>
            <div className="sales-total-row"><span>Total</span><span>${total.toLocaleString('es-MX')}</span></div>
          </>
        ) : (<p className="results-placeholder">Sin ventas registradas todavía.</p>)}
      </div>
      <div className="panel-card"><h2>Catálogo</h2><AmbassadorCatalogEditor ambassadorId={ambassador.id} products={products ?? []} catalogItems={catalogItems ?? []} /></div>
    </div>
  );
}
