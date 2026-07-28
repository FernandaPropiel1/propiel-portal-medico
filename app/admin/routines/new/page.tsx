import { createRoutine } from '../../actions';
export const dynamic = 'force-dynamic';
export default function NewRoutinePage() {
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Nueva rutina</h1>
      <form action={createRoutine} className="admin-form">
        <label>Título<input name="title" required placeholder="ej. Rutina Piel Sensible AM/PM" /></label>
        <label>Descripción<textarea name="description" placeholder="Para quién es y qué resuelve esta rutina" /></label>
        <label>Audiencia<select name="audience" defaultValue="ambassador"><option value="ambassador">Embajadoras</option><option value="doctor">Médicos</option><option value="all">Ambas</option></select></label>
        <label>Orden<input name="sort_order" type="number" defaultValue={0} /></label>
        <button type="submit" className="btn-primary">Crear rutina</button>
      </form>
    </div>
  );
}
