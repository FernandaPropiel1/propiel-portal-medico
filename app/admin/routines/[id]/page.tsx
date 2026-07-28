import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateRoutine, deleteRoutine } from '../../actions';
import RoutineItemsEditor from './RoutineItemsEditor';
export const dynamic = 'force-dynamic';
export default async function EditRoutinePage({ params }) {
  const supabase = createClient();
  const { data: routine } = await supabase.from('routines').select('*').eq('id', params.id).maybeSingle();
  if (!routine) notFound();
  const { data: products } = await supabase.from('products').select('id, title, step_label, step_order, brand_slug').order('step_order', { ascending: true }).order('title', { ascending: true });
  const { data: routineItems } = await supabase.from('routine_items').select('*').eq('routine_id', routine.id).order('sort_order', { ascending: true });
  const boundUpdate = updateRoutine.bind(null, routine.id);
  const boundDelete = deleteRoutine.bind(null, routine.id);
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>{routine.title}</h1>
      <div className="panel-card">
        <h2>Datos de la rutina</h2>
        <form action={boundUpdate} className="admin-form">
          <label>Título<input name="title" defaultValue={routine.title} required /></label>
          <label>Descripción<textarea name="description" defaultValue={routine.description ?? ''} /></label>
          <label>Audiencia<select name="audience" defaultValue={routine.audience}><option value="ambassador">Embajadoras</option><option value="doctor">Médicos</option><option value="all">Ambas</option></select></label>
          <label>Orden<input name="sort_order" type="number" defaultValue={routine.sort_order ?? 0} /></label>
          <button type="submit" className="btn-primary">Guardar cambios</button>
        </form>
      </div>
      <form action={boundDelete} style={{ margin: '20px 0' }}><button type="submit" className="btn-danger">Eliminar rutina</button></form>
      <div className="panel-card"><h2>Productos incluidos</h2><RoutineItemsEditor routineId={routine.id} products={products ?? []} routineItems={routineItems ?? []} /></div>
    </div>
  );
}
