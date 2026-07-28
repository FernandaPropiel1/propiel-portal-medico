import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/app/components/PortalNav';
import ReferralCode from './ReferralCode';
import { getSiteCopy } from '@/lib/siteCopy';

export const dynamic = 'force-dynamic';

export default async function PanelPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();
  if (!doctor) redirect('/login');

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  const { data: sales } = await supabase
    .from('doctor_sales')
    .select('*, products(title)')
    .eq('doctor_id', doctor.id)
    .order('sale_date', { ascending: false });

  const total = (sales ?? []).reduce((sum, s: any) => sum + Number(s.amount), 0);
  const copy = await getSiteCopy(supabase);

  return (
    <div>
      <PortalNav doctorName={doctor.full_name} isAdmin={!!adminRow} />
      <div className="page-header">
        <h1>Mi panel</h1>
        <p>{doctor.full_name} · {doctor.specialty}</p>
      </div>
      <div className="page-container">
        <div className="panel-card">
          <h2>Código de referido</h2>
          <ReferralCode code={doctor.referral_code} />
        </div>

        <div className="panel-card">
          <h2>Comisiones y beneficios</h2>
          <div className="commission-list">
            <div className="commission-row">
              <span>Marcas Exclusivas</span>
              <span className="commission-value">{copy.doctor_commission_exclusive_note}</span>
            </div>
            <div className="commission-row">
              <span>Marcas Generales</span>
              <span className="commission-value">{copy.doctor_commission_general_note}</span>
            </div>
            {doctor.has_isotretinoin_access && (
              <div className="commission-row">
                <span>Isotretinoína</span>
                <span className="commission-value">Sin comisión de referido · descuento al paciente</span>
              </div>
            )}
          </div>
          <p className="commission-note">{copy.doctor_patient_discount_note}</p>
          <p className="commission-note" style={{ fontStyle: 'italic' }}>
            {copy.disclaimer_no_acumulable}
          </p>
        </div>

        <div className="panel-card">
          <h2>Resultados</h2>
          {sales && sales.length > 0 ? (
            <>
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Monto</th>
                    <th>Nota</th>
                  </tr>
                </thead>
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
              <div className="sales-total-row">
                <span>Total registrado</span>
                <span>${total.toLocaleString('es-MX')}</span>
              </div>
            </>
          ) : (
            <p className="results-placeholder">
              Todavía no hay ventas registradas con tu código de referido. En cuanto se registre tu primera venta, aparecerá aquí.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
