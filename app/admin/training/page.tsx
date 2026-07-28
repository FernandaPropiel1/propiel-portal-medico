import { createClient } from '@/lib/supabase/server';
import { deleteTrainingMaterial } from '../actions';
import TrainingUploader from './TrainingUploader';
export const dynamic = 'force-dynamic';
export default async function AdminTrainingPage() {
  const supabase = createClient();
  const { data: materials } = await supabase.from('training_materials').select('*').order('created_at', { ascending: false });
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Capacitaciones</h1>
      <p className="admin-note" style={{ marginBottom: 20 }}>Sube aquí los archivos que quieres que las vendedoras vean en su pestaña de Capacitaciones.</p>
      <div className="panel-card"><h2>Subir archivo</h2><TrainingUploader /></div>
      <div className="panel-card">
        <h2>Archivos subidos</h2>
        {(materials ?? []).length === 0 ? (<p className="results-placeholder">Todavía no hay archivos.</p>) : (
          <table className="admin-table"><thead><tr><th>Título</th><th>Categoría</th><th>Audiencia</th><th></th><th></th></tr></thead>
            <tbody>{(materials ?? []).map((m) => { const boundDelete = deleteTrainingMaterial.bind(null, m.id, m.storage_path); return (<tr key={m.id}><td>{m.title}</td><td>{m.category ?? '—'}</td><td>{m.audience}</td><td><a href={m.file_url} target="_blank" rel="noreferrer" className="admin-product-link">Ver archivo</a></td><td><form action={boundDelete}><button type="submit" className="btn-danger">Eliminar</button></form></td></tr>); })}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
