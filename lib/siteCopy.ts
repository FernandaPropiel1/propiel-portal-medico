export const DEFAULT_COPY = {
  disclaimer_no_acumulable: 'Estos descuentos no son acumulables con otras promociones o descuentos vigentes en Propiel.',
  doctor_patient_discount_note: 'Tus pacientes tienen un 5% de descuento al surtir su receta en cualquier sucursal Propiel.',
  doctor_commission_exclusive_note: '10% de comisión',
  doctor_commission_general_note: '5% de comisión',
  ambassador_referred_discount_note: 'Las personas que compran con tu código tienen 10% de descuento en su compra.',
  ambassador_bonus_note: 'Por definir',
};
export const COPY_LABELS = {
  disclaimer_no_acumulable: 'Aviso: descuentos no acumulables (panel de médico y embajadora)',
  doctor_patient_discount_note: 'Panel médico: nota de descuento al paciente',
  doctor_commission_exclusive_note: 'Panel médico: comisión marcas exclusivas',
  doctor_commission_general_note: 'Panel médico: comisión marcas generales',
  ambassador_referred_discount_note: 'Panel embajadora: descuento a la persona referida',
  ambassador_bonus_note: 'Panel embajadora / admin: bono arriba de 100 referidos',
};
export async function getSiteCopy(supabase) {
  const { data } = await supabase.from('site_copy').select('key, value');
  const map = { ...DEFAULT_COPY };
  (data ?? []).forEach((row) => { if (row.value) map[row.key] = row.value; });
  return map;
}
