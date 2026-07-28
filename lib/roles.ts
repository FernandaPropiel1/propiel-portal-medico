export async function resolveHomePath(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return '/login';
  const email = user.email;
  const { data: admin } = await supabase.from('admin_users').select('email').eq('email', email).maybeSingle();
  if (admin) return '/admin';
  const { data: doctor } = await supabase.from('doctors').select('id').eq('email', email).maybeSingle();
  if (doctor) return '/catalogo';
  const { data: ambassador } = await supabase.from('ambassadors').select('id').eq('email', email).maybeSingle();
  if (ambassador) return '/embajadora/panel';
  const { data: seller } = await supabase.from('sellers').select('id').eq('email', email).maybeSingle();
  if (seller) return '/vendedora/panel';
  return '/login';
}
