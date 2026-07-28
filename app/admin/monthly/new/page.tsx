import { createClient } from '@/lib/supabase/server';
import { createMonthlyFeature } from '../../actions';
export const dynamic = 'force-dynamic';
export default async function NewMonthlyFeaturePage() {
  const supabase = createClient();
  const { data: routines } = await supabase.from('routines').select('id, title').order('title', { ascending: true });
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Nuevo mes</h1>
      <form action={createMonthlyFeature} className="admin-form">
        <label>Mes<input name="month_label" required placeholder="ej. Julio 2026" /></label>
        <label>Título del concepto<input name="concept_title" required placeholder="ej. Piel hidratada todo el verano" /></label>
        <label>Descripción del concepto<textarea name="concept_description" placeholder="El mensaje que las vendedoras van a transmitir este mes" /></label>
        <label>Rutina del mes (opcional)<select name="routine_id" defaultValue=""><option value="">— ninguna —</option>{(routines ?? []).map((r) => (<option key={r.id} value={r.id}>{r.title}</option>))}</select></label>
        <button type="submit" className="btn-primary">Crear</button>
      </form>
    </div>
  );
}
