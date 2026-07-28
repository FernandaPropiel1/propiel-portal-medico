import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/app/components/PortalNav';
import ReferralCode from '@/app/panel/ReferralCode';
import { getSiteCopy } from '@/lib/siteCopy';

export const dynamic = 'force-dynamic';

const NAV_ITEMS = [
  { href: '/embajadora/catalogo', label: 'Catálogo' },
  { href: '/embajadora/panel', label: 'Mi panel' },
];

export default async function EmbajadoraPanelPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: ambassador } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();
  if (!ambassador) redirect('/login');

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  const { data: sales } = await supabase
    .from('ambassador_sales')
    .select('*, products(title)')
    .eq('ambassador_id', ambassador.id)
    .order('sale_date', { ascending: false });

  const total = (sales ?? []).reduce((sum, s: any) => sum + Number(s.amount), 0);
  const referralCount = sales?.length ?? 0;
  const currentDiscount = referralCount >= 40 ? 18 : 15;
  const nextTierAt = referralCount < 40 ? 40 : referralCount < 100 ? 100 : null;
  const copy = await getSiteCopy(supabase);

  return (
    <div>
      <PortalNav doctorName={ambassador.full_name} isAdmin={!!adminRow} navItems={NAV_ITEMS} />
      <div className="page-header">
        <h1>Mi panel</h1>
        <p>{ambassador.full_name}{ambassador.instagram_handle ? ` · ${ambassador.instagram_handle}` : ''}</p>
      </div>
      <div className="page-container">
        <div className="panel-card">
          <h2>Código de referido</h2>
          <ReferralCode code={ambassador.referral_code} />
        </div>

        <div className="panel-card">
          <h2>Tu esquema de descuento</h2>
          <p className="admin-note" style={{ marginBottom: 12 }}>
            No es comisión por venta — es tu descuento personal, y va subiendo de nivel según tus referidos registrados.
          </p>
          <div className="commission-list">
            <div className="commission-row">
              <span>Tu descuento actual ({referralCount} referido{referralCount !== 1 ? 's' : ''} registrados)</span>
              <span className="commission-value">{currentDiscount}%</span>
            </div>
            <div className="commission-row">
              <span>Primeros 40 referidos</span>
              <span className="commission-value">15%</span>
            </div>
            <div className="commission-row">
              <span>De 40 en adelante</span>
              <span className="commission-value">18%</span>
            </div>
            <div className="commission-row">
              <span>Bono adicional arriba de 100 referidos</span>
              <span className="commission-value">{copy.ambassador_bonus_note}</span>
            </div>
          </div>
          {nextTierAt && (
            <p className="commission-note">
              Te faltan {nextTierAt - referralCount} referido{nextTierAt - referralCount !== 1 ? 's' : ''} para tu siguiente nivel ({nextTierAt} referidos).
            </p>
          )}
          <p className="commission-note">{copy.ambassador_referred_discount_note}</p>
          <p className="commission-note" style={{ fontStyle: 'italic' }}>
            {copy.disclaimer_no_acumulable}
          </p>
        </div>

        <div className="panel-card">
          <h2>Resultados</h2>
          {sales && sales.length > 0 ? (
            <>
              <table className="sales-table">
                <thead><tr><th>Fecha</th><th>Producto</th><th>Monto</th><th>Nota</th></tr></thead>
                <tbody>
                  {sales.map((s: any) => (
                    <tr key={s.id}>
                      <td>{new Date(s.sale_date).toLocaleDateString('es-MX')}</td>
                      <td>{s.products?.title ?? '—'}</td>
                      <td>${Number(s.amount).toLocaleString('es-MX')}</td>
                      <td>{s.note ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="sales-total-row"><span>Total registrado</span><span>${total.toLocaleString('es-MX')}</span></div>
            </>
          ) : (
            <p className="results-placeholder">Todavía no hay ventas registradas con tu código.</p>
          )}
        </div>
      </div>
    </div>
  );
}
