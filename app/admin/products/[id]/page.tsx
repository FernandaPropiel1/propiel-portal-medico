import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateProduct, deleteProduct, formatKeyIngredients } from '../../actions';
import ProductAssignment from './ProductAssignment';
export const dynamic = 'force-dynamic';
export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id).maybeSingle();
  if (!product) notFound();
  const { data: brands } = await supabase.from('brands').select('slug, name').order('name');
  const { data: doctors } = await supabase.from('doctors').select('id, full_name').order('full_name');
  const { data: ambassadors } = await supabase.from('ambassadors').select('id, full_name').order('full_name');
  const { data: doctorItems } = await supabase.from('doctor_catalog_items').select('doctor_id').eq('product_id', product.id);
  const { data: ambassadorItems } = await supabase.from('ambassador_catalog_items').select('ambassador_id').eq('product_id', product.id);
  const boundUpdate = updateProduct.bind(null, product.id);
  const boundDelete = deleteProduct.bind(null, product.id);
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>{product.title}</h1>
      <form action={boundUpdate} className="admin-form">
        <label>Título<input name="title" defaultValue={product.title} required /></label>
        <label>Marca / vendor<input name="vendor" defaultValue={product.vendor ?? ''} /></label>
        <label>Precio<input name="price" type="number" step="0.01" defaultValue={product.price ?? ''} /></label>
        <label>Moneda<input name="currency" defaultValue={product.currency ?? 'MXN'} /></label>
        <label>URL de imagen<input name="image_url" defaultValue={product.image_url ?? ''} /></label>
        <label>Descripción<textarea name="description" defaultValue={product.description ?? ''} /></label>
        <label>Tipo de piel destacado<input name="highlight_skin_type" defaultValue={product.highlight_skin_type ?? ''} /></label>
        <label>Ingrediente clave<input name="highlight_ingredient" defaultValue={product.highlight_ingredient ?? ''} /></label>
        <label>Para qué sirve<input name="highlight_benefit" defaultValue={product.highlight_benefit ?? ''} /></label>
        <label>Necesidades (separadas por coma)<input name="needs" defaultValue={(product.needs ?? []).join(', ')} /></label>
        <label>Ingredientes clave (uno por línea; agrega " | concentración" si aplica, ej. "Ácido Azelaico | 15%")
          <textarea name="key_ingredients" defaultValue={await formatKeyIngredients(product.key_ingredients)} placeholder={'Ácido Hialurónico\nÁcido Azelaico | 15%\nNiacinamida | 10%'} />
        </label>
        <label>Tipos de piel (separados por coma)<input name="skin_types" defaultValue={(product.skin_types ?? []).join(', ')} /></label>
        <label>Categoría / tipo de producto (step_label)<input name="step_label" defaultValue={product.step_label ?? ''} /></label>
        <label>Orden dentro de la categoría<input name="step_order" type="number" defaultValue={product.step_order ?? 99} /></label>
        <label>Sub-tipo<input name="product_subtype" defaultValue={product.product_subtype ?? ''} placeholder="ej. Hidratante" /></label>
        <label>Modo de uso<textarea name="usage_instructions" defaultValue={product.usage_instructions ?? ''} /></label>
        <label>Ingredientes completos<textarea name="ingredients_full" defaultValue={product.ingredients_full ?? ''} /></label>
        <label>Combina bien con<textarea name="pairs_well_with" defaultValue={product.pairs_well_with ?? ''} /></label>
        <label>Evitar combinar con<textarea name="avoid_combining_with" defaultValue={product.avoid_combining_with ?? ''} /></label>
        <label>Marca exclusiva<select name="brand_slug" defaultValue={product.brand_slug ?? ''}><option value="">— ninguna —</option>{(brands ?? []).map((b: any) => (<option key={b.slug} value={b.slug}>{b.name}</option>))}</select></label>
        <label>Disponible en
          <div style={{ display: 'flex', gap: 16 }}>
            <label className="admin-checkbox-label"><input type="checkbox" name="city_mty" defaultChecked={(product.available_cities ?? ['MTY', 'Torreón']).includes('MTY')} /> Monterrey</label>
            <label className="admin-checkbox-label"><input type="checkbox" name="city_trc" defaultChecked={(product.available_cities ?? ['MTY', 'Torreón']).includes('Torreón')} /> Torreón</label>
          </div>
        </label>
        <button type="submit" className="btn-primary">Guardar cambios</button>
      </form>
      <form action={boundDelete} style={{ marginTop: 20 }}><button type="submit" className="btn-danger">Eliminar producto</button></form>
      <div className="panel-card" style={{ marginTop: 24 }}>
        <h2>Asignar a médicos / embajadoras</h2>
        <ProductAssignment productId={product.id} doctors={doctors ?? []} ambassadors={ambassadors ?? []} doctorIds={(doctorItems ?? []).map((d: any) => d.doctor_id)} ambassadorIds={(ambassadorItems ?? []).map((a: any) => a.ambassador_id)} />
      </div>
    </div>
  );
}
