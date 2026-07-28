'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
function splitList(value) { if (!value) return []; return String(value).split(',').map((s) => s.trim()).filter(Boolean); }
function readCities(formData) { const cities = []; if (formData.get('city_mty') === 'on') cities.push('MTY'); if (formData.get('city_trc') === 'on') cities.push('Torreón'); return cities.length > 0 ? cities : ['MTY', 'Torreón']; }
export async function createDoctor(formData) {
  const supabase = createClient();
  const doctor = { full_name: String(formData.get('full_name') ?? ''), specialty: String(formData.get('specialty') ?? ''), city: String(formData.get('city') ?? ''), clinic_name: String(formData.get('clinic_name') ?? ''), referral_code: String(formData.get('referral_code') ?? '').toUpperCase(), email: String(formData.get('email') ?? ''), status: 'pending_access' };
  const { data, error } = await supabase.from('doctors').insert(doctor).select('id').single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  redirect(`/admin/doctors/${data.id}`);
}
export async function updateDoctor(doctorId, formData) {
  const supabase = createClient();
  const updates = { full_name: String(formData.get('full_name') ?? ''), specialty: String(formData.get('specialty') ?? ''), city: String(formData.get('city') ?? ''), clinic_name: String(formData.get('clinic_name') ?? ''), referral_code: String(formData.get('referral_code') ?? '').toUpperCase(), email: String(formData.get('email') ?? ''), status: String(formData.get('status') ?? 'active'), has_isotretinoin_access: formData.get('has_isotretinoin_access') === 'on' };
  const { error } = await supabase.from('doctors').update(updates).eq('id', doctorId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/doctors/${doctorId}`); revalidatePath('/admin'); revalidatePath('/panel');
}
export async function setCatalogItem(doctorId, productId, inCatalog, isNewLaunch) {
  const supabase = createClient();
  if (!inCatalog) { const { error } = await supabase.from('doctor_catalog_items').delete().eq('doctor_id', doctorId).eq('product_id', productId); if (error) throw new Error(error.message); }
  else { const { error } = await supabase.from('doctor_catalog_items').upsert({ doctor_id: doctorId, product_id: productId, category_slug: 'general', is_new_launch: isNewLaunch }, { onConflict: 'doctor_id,product_id' }); if (error) throw new Error(error.message); }
  revalidatePath(`/admin/doctors/${doctorId}`); revalidatePath(`/admin/products/${productId}`); revalidatePath('/catalogo');
}
export async function createProduct(formData) {
  const supabase = createClient();
  const idRaw = formData.get('id');
  if (!idRaw) throw new Error('Falta el ID del producto (usa el ID de Shopify).');
  const product = { id: Number(idRaw), title: String(formData.get('title') ?? ''), vendor: String(formData.get('vendor') ?? '') || null, price: formData.get('price') ? Number(formData.get('price')) : null, currency: String(formData.get('currency') ?? 'MXN'), image_url: String(formData.get('image_url') ?? '') || null, description: String(formData.get('description') ?? '') || null, highlight_skin_type: String(formData.get('highlight_skin_type') ?? '') || null, highlight_ingredient: String(formData.get('highlight_ingredient') ?? '') || null, highlight_benefit: String(formData.get('highlight_benefit') ?? '') || null, needs: splitList(formData.get('needs')), skin_types: splitList(formData.get('skin_types')), step_label: String(formData.get('step_label') ?? '') || null, step_order: formData.get('step_order') ? Number(formData.get('step_order')) : 99, product_subtype: String(formData.get('product_subtype') ?? '') || null, ingredients_full: String(formData.get('ingredients_full') ?? '') || null, usage_instructions: String(formData.get('usage_instructions') ?? '') || null, pairs_well_with: String(formData.get('pairs_well_with') ?? '') || null, avoid_combining_with: String(formData.get('avoid_combining_with') ?? '') || null, brand_slug: String(formData.get('brand_slug') ?? '') || null, available_cities: readCities(formData) };
  const { error } = await supabase.from('products').insert(product);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  redirect(`/admin/products/${product.id}`);
}
export async function updateProduct(productId, formData) {
  const supabase = createClient();
  const updates = { title: String(formData.get('title') ?? ''), vendor: String(formData.get('vendor') ?? '') || null, price: formData.get('price') ? Number(formData.get('price')) : null, currency: String(formData.get('currency') ?? 'MXN'), image_url: String(formData.get('image_url') ?? '') || null, description: String(formData.get('description') ?? '') || null, highlight_skin_type: String(formData.get('highlight_skin_type') ?? '') || null, highlight_ingredient: String(formData.get('highlight_ingredient') ?? '') || null, highlight_benefit: String(formData.get('highlight_benefit') ?? '') || null, needs: splitList(formData.get('needs')), skin_types: splitList(formData.get('skin_types')), step_label: String(formData.get('step_label') ?? '') || null, step_order: formData.get('step_order') ? Number(formData.get('step_order')) : 99, product_subtype: String(formData.get('product_subtype') ?? '') || null, ingredients_full: String(formData.get('ingredients_full') ?? '') || null, usage_instructions: String(formData.get('usage_instructions') ?? '') || null, pairs_well_with: String(formData.get('pairs_well_with') ?? '') || null, avoid_combining_with: String(formData.get('avoid_combining_with') ?? '') || null, brand_slug: String(formData.get('brand_slug') ?? '') || null, available_cities: readCities(formData), updated_at: new Date().toISOString() };
  const { error } = await supabase.from('products').update(updates).eq('id', productId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/products/${productId}`); revalidatePath('/admin/products'); revalidatePath('/catalogo');
}
export async function deleteProduct(productId) {
  const supabase = createClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  redirect('/admin/products');
}
export async function logSale(doctorId, formData) {
  const supabase = createClient();
  const productIdRaw = formData.get('product_id');
  const sale = { doctor_id: doctorId, product_id: productIdRaw ? Number(productIdRaw) : null, amount: Number(formData.get('amount') ?? 0), sale_date: String(formData.get('sale_date') ?? new Date().toISOString().slice(0, 10)), note: String(formData.get('note') ?? '') || null };
  const { error } = await supabase.from('doctor_sales').insert(sale);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/doctors/${doctorId}`); revalidatePath('/panel');
}
export async function deleteSale(saleId, doctorId) {
  const supabase = createClient();
  const { error } = await supabase.from('doctor_sales').delete().eq('id', saleId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/doctors/${doctorId}`); revalidatePath('/panel');
}
export async function createAmbassador(formData) {
  const supabase = createClient();
  const ambassador = { full_name: String(formData.get('full_name') ?? ''), instagram_handle: String(formData.get('instagram_handle') ?? '') || null, referral_code: String(formData.get('referral_code') ?? '').toUpperCase(), email: String(formData.get('email') ?? ''), status: 'pending_access' };
  const { data, error } = await supabase.from('ambassadors').insert(ambassador).select('id').single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/ambassadors');
  redirect(`/admin/ambassadors/${data.id}`);
}
export async function updateAmbassador(ambassadorId, formData) {
  const supabase = createClient();
  const commissionRaw = formData.get('commission_rate');
  const updates = { full_name: String(formData.get('full_name') ?? ''), instagram_handle: String(formData.get('instagram_handle') ?? '') || null, referral_code: String(formData.get('referral_code') ?? '').toUpperCase(), email: String(formData.get('email') ?? ''), status: String(formData.get('status') ?? 'active'), commission_rate: commissionRaw ? Number(commissionRaw) : null };
  const { error } = await supabase.from('ambassadors').update(updates).eq('id', ambassadorId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/ambassadors/${ambassadorId}`); revalidatePath('/admin/ambassadors'); revalidatePath('/embajadora/panel');
}
export async function setAmbassadorCatalogItem(ambassadorId, productId, inCatalog, isFeatured) {
  const supabase = createClient();
  if (!inCatalog) { const { error } = await supabase.from('ambassador_catalog_items').delete().eq('ambassador_id', ambassadorId).eq('product_id', productId); if (error) throw new Error(error.message); }
  else { const { error } = await supabase.from('ambassador_catalog_items').upsert({ ambassador_id: ambassadorId, product_id: productId, is_featured_this_month: isFeatured }, { onConflict: 'ambassador_id,product_id' }); if (error) throw new Error(error.message); }
  revalidatePath(`/admin/ambassadors/${ambassadorId}`); revalidatePath(`/admin/products/${productId}`); revalidatePath('/embajadora/catalogo');
}
export async function logAmbassadorSale(ambassadorId, formData) {
  const supabase = createClient();
  const productIdRaw = formData.get('product_id');
  const sale = { ambassador_id: ambassadorId, product_id: productIdRaw ? Number(productIdRaw) : null, amount: Number(formData.get('amount') ?? 0), sale_date: String(formData.get('sale_date') ?? new Date().toISOString().slice(0, 10)), note: String(formData.get('note') ?? '') || null };
  const { error } = await supabase.from('ambassador_sales').insert(sale);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/ambassadors/${ambassadorId}`); revalidatePath('/embajadora/panel');
}
export async function createSeller(formData) {
  const supabase = createClient();
  const seller = { full_name: String(formData.get('full_name') ?? ''), branch: String(formData.get('branch') ?? '') || null, city: String(formData.get('city') ?? '') || null, email: String(formData.get('email') ?? ''), status: 'pending_access' };
  const { data, error } = await supabase.from('sellers').insert(seller).select('id').single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/sellers');
  redirect(`/admin/sellers/${data.id}`);
}
export async function updateSeller(sellerId, formData) {
  const supabase = createClient();
  const updates = { full_name: String(formData.get('full_name') ?? ''), branch: String(formData.get('branch') ?? '') || null, city: String(formData.get('city') ?? '') || null, email: String(formData.get('email') ?? ''), status: String(formData.get('status') ?? 'active') };
  const { error } = await supabase.from('sellers').update(updates).eq('id', sellerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/sellers/${sellerId}`); revalidatePath('/admin/sellers'); revalidatePath('/vendedora/panel');
}
export async function setPromotedProduct(productId, promoted, note) {
  const supabase = createClient();
  if (!promoted) { const { error } = await supabase.from('seller_promoted_products').delete().eq('product_id', productId); if (error) throw new Error(error.message); }
  else { const { error } = await supabase.from('seller_promoted_products').upsert({ product_id: productId, note: note || null }, { onConflict: 'product_id' }); if (error) throw new Error(error.message); }
  revalidatePath('/admin/promoted-products'); revalidatePath('/vendedora/panel');
}
export async function createRoutine(formData) {
  const supabase = createClient();
  const routine = { title: String(formData.get('title') ?? ''), description: String(formData.get('description') ?? '') || null, audience: String(formData.get('audience') ?? 'ambassador'), sort_order: formData.get('sort_order') ? Number(formData.get('sort_order')) : 0 };
  const { data, error } = await supabase.from('routines').insert(routine).select('id').single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/routines');
  redirect(`/admin/routines/${data.id}`);
}
export async function updateRoutine(routineId, formData) {
  const supabase = createClient();
  const updates = { title: String(formData.get('title') ?? ''), description: String(formData.get('description') ?? '') || null, audience: String(formData.get('audience') ?? 'ambassador'), sort_order: formData.get('sort_order') ? Number(formData.get('sort_order')) : 0 };
  const { error } = await supabase.from('routines').update(updates).eq('id', routineId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/routines/${routineId}`); revalidatePath('/admin/routines'); revalidatePath('/embajadora/catalogo');
}
export async function deleteRoutine(routineId) {
  const supabase = createClient();
  const { error } = await supabase.from('routines').delete().eq('id', routineId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/routines');
  redirect('/admin/routines');
}
export async function setRoutineItem(routineId, productId, included, stepNote, sortOrder) {
  const supabase = createClient();
  if (!included) { const { error } = await supabase.from('routine_items').delete().eq('routine_id', routineId).eq('product_id', productId); if (error) throw new Error(error.message); }
  else { const { error } = await supabase.from('routine_items').upsert({ routine_id: routineId, product_id: productId, step_note: stepNote || null, sort_order: sortOrder }, { onConflict: 'routine_id,product_id' }); if (error) throw new Error(error.message); }
  revalidatePath(`/admin/routines/${routineId}`); revalidatePath('/embajadora/catalogo');
}
export async function createTrainingMaterial(formData) {
  const supabase = createClient();
  const material = { title: String(formData.get('title') ?? ''), category: String(formData.get('category') ?? '') || null, audience: String(formData.get('audience') ?? 'sellers'), file_url: String(formData.get('file_url') ?? ''), file_name: String(formData.get('file_name') ?? '') || null, storage_path: String(formData.get('storage_path') ?? '') || null };
  if (!material.file_url) throw new Error('Falta la URL del archivo subido.');
  const { error } = await supabase.from('training_materials').insert(material);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/training'); revalidatePath('/vendedora/panel');
}
export async function deleteTrainingMaterial(id, storagePath) {
  const supabase = createClient();
  if (storagePath) { await supabase.storage.from('training-materials').remove([storagePath]); }
  const { error } = await supabase.from('training_materials').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/training'); revalidatePath('/vendedora/panel');
}
export async function createSellerReferral(sellerId, formData) {
  const supabase = createClient();
  const doctorIdRaw = String(formData.get('referred_doctor_id') ?? '');
  const ambassadorIdRaw = String(formData.get('referred_ambassador_id') ?? '');
  const folio = String(formData.get('folio') ?? '');
  const saleDate = String(formData.get('sale_date') ?? new Date().toISOString().slice(0, 10));
  const note = String(formData.get('note') ?? '') || null;
  if (!folio) throw new Error('Falta el folio de Microsip.');
  const record = { seller_id: sellerId, folio, sale_date: saleDate, referred_doctor_id: doctorIdRaw || null, referred_ambassador_id: ambassadorIdRaw || null, note };
  const { error } = await supabase.from('seller_sale_records').insert(record);
  if (error) throw new Error(error.message);
  if (ambassadorIdRaw) {
    const { error: ambError } = await supabase.from('ambassador_sales').insert({ ambassador_id: ambassadorIdRaw, product_id: null, amount: 0, sale_date: saleDate, note: `Venta en tienda física · folio ${folio}` });
    if (ambError) throw new Error(ambError.message);
    revalidatePath('/embajadora/panel'); revalidatePath(`/admin/ambassadors/${ambassadorIdRaw}`); revalidatePath('/admin/ambassadors');
  }
  revalidatePath('/vendedora/panel'); revalidatePath('/admin/seller-sales');
}
export async function confirmDoctorReferralAmount(recordId, formData) {
  const supabase = createClient();
  const { data: record } = await supabase.from('seller_sale_records').select('*').eq('id', recordId).maybeSingle();
  if (!record) throw new Error('No se encontró el registro.');
  if (!record.referred_doctor_id) throw new Error('Este registro no tiene médico referido.');
  const amount = Number(formData.get('amount') ?? 0);
  const commissionPct = formData.get('commission_pct') ? Number(formData.get('commission_pct')) : null;
  const { error: updateError } = await supabase.from('seller_sale_records').update({ amount, commission_pct: commissionPct, synced_to_doctor_sales: true }).eq('id', recordId);
  if (updateError) throw new Error(updateError.message);
  const { error: saleError } = await supabase.from('doctor_sales').insert({ doctor_id: record.referred_doctor_id, product_id: null, amount, sale_date: record.sale_date, note: `Folio ${record.folio} · tienda física${commissionPct ? ` · ${commissionPct}% comisión` : ''}` });
  if (saleError) throw new Error(saleError.message);
  revalidatePath('/admin/seller-sales'); revalidatePath(`/admin/doctors/${record.referred_doctor_id}`); revalidatePath('/panel');
}
export async function createMonthlyFeature(formData) {
  const supabase = createClient();
  const feature = { month_label: String(formData.get('month_label') ?? ''), concept_title: String(formData.get('concept_title') ?? ''), concept_description: String(formData.get('concept_description') ?? '') || null, routine_id: String(formData.get('routine_id') ?? '') || null };
  const { data, error } = await supabase.from('seller_monthly_feature').insert(feature).select('id').single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/monthly');
  redirect(`/admin/monthly/${data.id}`);
}
export async function updateMonthlyFeature(featureId, formData) {
  const supabase = createClient();
  const updates = { month_label: String(formData.get('month_label') ?? ''), concept_title: String(formData.get('concept_title') ?? ''), concept_description: String(formData.get('concept_description') ?? '') || null, routine_id: String(formData.get('routine_id') ?? '') || null };
  const { error } = await supabase.from('seller_monthly_feature').update(updates).eq('id', featureId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/monthly/${featureId}`); revalidatePath('/admin/monthly'); revalidatePath('/vendedora/panel');
}
export async function setCurrentMonthlyFeature(featureId) {
  const supabase = createClient();
  const { error: clearError } = await supabase.from('seller_monthly_feature').update({ is_current: false }).neq('id', featureId);
  if (clearError) throw new Error(clearError.message);
  const { error } = await supabase.from('seller_monthly_feature').update({ is_current: true }).eq('id', featureId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/monthly'); revalidatePath('/vendedora/panel');
}
export async function deleteMonthlyFeature(featureId) {
  const supabase = createClient();
  const { error } = await supabase.from('seller_monthly_feature').delete().eq('id', featureId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/monthly');
  redirect('/admin/monthly');
}
export async function addMonthlyDuo(featureId, formData) {
  const supabase = createClient();
  const duo = { feature_id: featureId, product_a_id: Number(formData.get('product_a_id')), product_b_id: Number(formData.get('product_b_id')), note: String(formData.get('note') ?? '') || null };
  if (!duo.product_a_id || !duo.product_b_id) throw new Error('Selecciona los dos productos del dúo.');
  const { error } = await supabase.from('seller_monthly_duos').insert(duo);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/monthly/${featureId}`); revalidatePath('/vendedora/panel');
}
export async function deleteMonthlyDuo(duoId, featureId) {
  const supabase = createClient();
  const { error } = await supabase.from('seller_monthly_duos').delete().eq('id', duoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/monthly/${featureId}`); revalidatePath('/vendedora/panel');
}
export async function addMonthlyPromotion(featureId, formData) {
  const supabase = createClient();
  const promo = { feature_id: featureId, title: String(formData.get('title') ?? ''), description: String(formData.get('description') ?? '') || null };
  if (!promo.title) throw new Error('Falta el título de la promoción.');
  const { error } = await supabase.from('seller_monthly_promotions').insert(promo);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/monthly/${featureId}`); revalidatePath('/vendedora/panel');
}
export async function deleteMonthlyPromotion(promoId, featureId) {
  const supabase = createClient();
  const { error } = await supabase.from('seller_monthly_promotions').delete().eq('id', promoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/monthly/${featureId}`); revalidatePath('/vendedora/panel');
}
export async function updateSiteCopy(key, value) {
  const supabase = createClient();
  const { error } = await supabase.from('site_copy').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/copy'); revalidatePath('/panel'); revalidatePath('/embajadora/panel'); revalidatePath(`/admin/ambassadors`);
}
