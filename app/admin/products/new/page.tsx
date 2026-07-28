import { createClient } from '@/lib/supabase/server';
import { createProduct } from '../../actions';
export const dynamic = 'force-dynamic';
export default async function NewProductPage() {
  const supabase = createClient();
  const { data: brands } = await supabase.from('brands').select('slug, name').order('name');
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Agregar producto</h1>
      <form action={createProduct} className="admin-form">
        <label>ID de Shopify (numérico)<input name="id" type="number" required /></label>
        <label>Título<input name="title" required /></label>
        <label>Marca / vendor<input name="vendor" /></label>
        <label>Precio<input name="price" type="number" step="0.01" /></label>
        <label>Moneda<input name="currency" defaultValue="MXN" /></label>
        <label>URL de imagen<input name="image_url" /></label>
        <label>Descripción<textarea name="description" /></label>
        <label>Tipo de piel destacado<input name="highlight_skin_type" /></label>
        <label>Ingrediente clave<input name="highlight_ingredient" /></label>
        <label>Para qué sirve<input name="highlight_benefit" /></label>
        <label>Necesidades (separadas por coma)<input name="needs" /></label>
        <label>Tipos de piel (separados por coma)<input name="skin_types" /></label>
        <label>Categoría / tipo de producto (step_label)<input name="step_label" /></label>
        <label>Orden dentro de la categoría<input name="step_order" type="number" defaultValue={99} /></label>
        <label>Sub-tipo<input name="product_subtype" placeholder="ej. Hidratante" /></label>
        <label>Modo de uso<textarea name="usage_instructions" /></label>
        <label>Ingredientes completos<textarea name="ingredients_full" /></label>
        <label>Combina bien con<textarea name="pairs_well_with" /></label>
        <label>Evitar combinar con<textarea name="avoid_combining_with" /></label>
        <label>Marca exclusiva<select name="brand_slug" defaultValue=""><option value="">— ninguna —</option>{(brands ?? []).map((b: any) => (<option key={b.slug} value={b.slug}>{b.name}</option>))}</select></label>
        <label>Disponible en
          <div style={{ display: 'flex', gap: 16 }}>
            <label className="admin-checkbox-label"><input type="checkbox" name="city_mty" defaultChecked /> Monterrey</label>
            <label className="admin-checkbox-label"><input type="checkbox" name="city_trc" defaultChecked /> Torreón</label>
          </div>
        </label>
        <button type="submit" className="btn-primary">Crear producto</button>
      </form>
    </div>
  );
}
