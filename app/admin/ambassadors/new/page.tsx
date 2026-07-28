import { createAmbassador } from '../../actions';
export const dynamic = 'force-dynamic';
export default function NewAmbassadorPage() {
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Nueva embajadora</h1>
      <form action={createAmbassador} className="admin-form">
        <label>Nombre completo<input name="full_name" required /></label>
        <label>Instagram (opcional)<input name="instagram_handle" placeholder="@usuario" /></label>
        <label>Código de referido<input name="referral_code" required style={{ textTransform: 'uppercase' }} /></label>
        <label>Correo<input name="email" type="email" required /></label>
        <button type="submit" className="btn-primary">Crear embajadora</button>
      </form>
    </div>
  );
}
