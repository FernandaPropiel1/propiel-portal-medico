import { createSeller } from '../../actions';
export const dynamic = 'force-dynamic';
export default function NewSellerPage() {
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Nueva vendedora</h1>
      <form action={createSeller} className="admin-form">
        <label>Nombre completo<input name="full_name" required /></label>
        <label>Ciudad<select name="city" defaultValue=""><option value="">— selecciona —</option><option value="MTY">Monterrey</option><option value="Torreón">Torreón</option></select></label>
        <label>Sucursal<input name="branch" placeholder="ej. Chipinque, Vasconcelos, Fresno, 505, Gomez, Italia, Tabachines" /></label>
        <label>Correo<input name="email" type="email" required /></label>
        <button type="submit" className="btn-primary">Crear vendedora</button>
      </form>
    </div>
  );
}
