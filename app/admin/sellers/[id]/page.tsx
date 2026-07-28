import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateSeller } from '../../actions';
export const dynamic = 'force-dynamic';
export default async function EditSellerPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: seller } = await supabase.from('sellers').select('*').eq('id', params.id).maybeSingle();
  if (!seller) notFound();
  const boundUpdate = updateSeller.bind(null, seller.id);
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>{seller.full_name}</h1>
      {seller.status === 'pending_access' && (<div className="admin-callout">Esta vendedora todavía no tiene acceso activado.</div>)}
      <div className="panel-card">
        <h2>Perfil</h2>
        <form action={boundUpdate} className="admin-form">
          <label>Nombre completo<input name="full_name" defaultValue={seller.full_name} required /></label>
          <label>Ciudad<select name="city" defaultValue={seller.city ?? ''}><option value="">— selecciona —</option><option value="MTY">Monterrey</option><option value="Torreón">Torreón</option></select></label>
          <label>Sucursal<input name="branch" defaultValue={seller.branch ?? ''} placeholder="ej. Chipinque, Vasconcelos, Fresno, 505, Gomez, Italia, Tabachines" /></label>
          <label>Correo<input name="email" type="email" defaultValue={seller.email} required /></label>
          <label>Estatus<select name="status" defaultValue={seller.status}><option value="active">active</option><option value="pending_access">pending_access</option><option value="paused">paused</option></select></label>
          <button type="submit" className="btn-primary">Guardar cambios</button>
        </form>
      </div>
    </div>
  );
}
