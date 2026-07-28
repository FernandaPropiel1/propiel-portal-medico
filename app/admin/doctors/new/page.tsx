import { createDoctor } from '../../actions';
export const dynamic = 'force-dynamic';
export default function NewDoctorPage() {
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Nuevo médico</h1>
      <form action={createDoctor} className="admin-form">
        <label>Nombre completo<input name="full_name" required /></label>
        <label>Especialidad<input name="specialty" /></label>
        <label>Ciudad<input name="city" /></label>
        <label>Clínica / consultorio<input name="clinic_name" /></label>
        <label>Código de referido<input name="referral_code" required style={{ textTransform: 'uppercase' }} /></label>
        <label>Correo<input name="email" type="email" required /></label>
        <button type="submit" className="btn-primary">Crear médico</button>
      </form>
    </div>
  );
}
