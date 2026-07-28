import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  updateMonthlyFeature,
  deleteMonthlyFeature,
  setCurrentMonthlyFeature,
  addMonthlyDuo,
  deleteMonthlyDuo,
  addMonthlyPromotion,
  deleteMonthlyPromotion,
} from '../../actions';

export const dynamic = 'force-dynamic';

export default async function EditMonthlyFeaturePage({ params }) {
  const supabase = createClient();

  const { data: feature } = await supabase
    .from('seller_monthly_feature')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (!feature) notFound();

  const { data: routines } = await supabase.from('routines').select('id, title').order('title', { ascending: true });
  const { data: products } = await supabase.from('products').select('id, title').order('title', { ascending: true });
  const { data: duos } = await supabase
    .from('seller_monthly_duos')
    .select('*, product_a:product_a_id(id, title), product_b:product_b_id(id, title)')
    .eq('feature_id', feature.id)
    .order('sort_order', { ascending: true });
  const { data: promotions } = await supabase
    .from('seller_monthly_promotions')
    .select('*')
    .eq('feature_id', feature.id)
    .order('sort_order', { ascending: true });

  const boundUpdate = updateMonthlyFeature.bind(null, feature.id);
  const boundDelete = deleteMonthlyFeature.bind(null, feature.id);
  const boundSetCurrent = setCurrentMonthlyFeature.bind(null, feature.id);
  const boundAddDuo = addMonthlyDuo.bind(null, feature.id);
  const boundAddPromo = addMonthlyPromotion.bind(null, feature.id);

  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>{feature.month_label}</h1>

      {feature.is_current ? (
        <div className="admin-callout">Este es el mes activo — es lo que ven las vendedoras ahora mismo en "Del mes".</div>
      ) : (
        <form action={boundSetCurrent} style={{ marginBottom: 20 }}>
          <button type="submit" className="btn-primary">Marcar como mes actual</button>
        </form>
      )}

      <div className="panel-card">
        <h2>Concepto</h2>
        <form action={boundUpdate} className="admin-form">
          <label>Mes<input name="month_label" defaultValue={feature.month_label} required /></label>
          <label>Título del concepto<input name="concept_title" defaultValue={feature.concept_title} required /></label>
          <label>Descripción del concepto<textarea name="concept_description" defaultValue={feature.concept_description ?? ''} /></label>
          <label>
            Rutina del mes
            <select name="routine_id" defaultValue={feature.routine_id ?? ''}>
              <option value="">— ninguna —</option>
              {(routines ?? []).map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary">Guardar cambios</button>
        </form>
      </div>

      <div className="panel-card">
        <h2>Dúos recomendados</h2>
        <form action={boundAddDuo} className="admin-form" style={{ marginBottom: 20 }}>
          <label>
            Producto A
            <select name="product_a_id" required defaultValue="">
              <option value="">— selecciona —</option>
              {(products ?? []).map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
            </select>
          </label>
          <label>
            Producto B
            <select name="product_b_id" required defaultValue="">
              <option value="">— selecciona —</option>
              {(products ?? []).map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
            </select>
          </label>
          <label>Nota (opcional)<input name="note" placeholder="ej. Úsalos juntos AM/PM" /></label>
          <button type="submit" className="btn-primary">Agregar dúo</button>
        </form>

        {(duos ?? []).map((d) => {
          const boundDeleteDuo = deleteMonthlyDuo.bind(null, d.id, feature.id);
          return (
            <div className="catalog-editor-row" key={d.id}>
              <span className="catalog-editor-row-title">
                {d.product_a?.title} + {d.product_b?.title}
                {d.note && <span className="catalog-brand-tag">{d.note}</span>}
              </span>
              <form action={boundDeleteDuo}>
                <button type="submit" className="btn-danger">Eliminar</button>
              </form>
            </div>
          );
        })}
        {(!duos || duos.length === 0) && <p className="results-placeholder">Todavía no hay dúos armados.</p>}
      </div>

      <div className="panel-card">
        <h2>Promociones activas</h2>
        <form action={boundAddPromo} className="admin-form" style={{ marginBottom: 20 }}>
          <label>Título<input name="title" required placeholder="ej. 2x1 en protector solar" /></label>
          <label>Descripción<textarea name="description" placeholder="Detalle de la promoción" /></label>
          <button type="submit" className="btn-primary">Agregar promoción</button>
        </form>

        {(promotions ?? []).map((p) => {
          const boundDeletePromo = deleteMonthlyPromotion.bind(null, p.id, feature.id);
          return (
            <div className="catalog-editor-row" key={p.id}>
              <span className="catalog-editor-row-title">
                {p.title}
                {p.description && <span className="catalog-brand-tag">{p.description}</span>}
              </span>
              <form action={boundDeletePromo}>
                <button type="submit" className="btn-danger">Eliminar</button>
              </form>
            </div>
          );
        })}
        {(!promotions || promotions.length === 0) && <p className="results-placeholder">Todavía no hay promociones agregadas.</p>}
      </div>

      <form action={boundDelete} style={{ marginTop: 20 }}>
        <button type="submit" className="btn-danger">Eliminar este mes</button>
      </form>
    </div>
  );
}
