'use client';

import { useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { createSellerReferral } from '@/app/admin/actions';

type KeyIngredient = { name: string; concentration: string | null };

type Product = {
  id: number;
  title: string;
  vendor: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  needs: string[] | null;
  key_ingredients: KeyIngredient[] | null;
  highlight_ingredient: string | null;
  highlight_benefit: string | null;
  available_cities: string[] | null;
};

const CATEGORY_PALETTE = [
  '#eef2ee', '#fbeee3', '#f3ece1', '#eef0f7', '#fbf0ee',
  '#eef4f0', '#f6efe4', '#efeef7', '#f9eef2', '#eef7f5',
  '#f4f0e6', '#eef2f7',
];

type Promoted = { id: string; note: string | null; products: Product };
type Material = { id: string; title: string; category: string | null; file_url: string };
type Brand = { slug: string; name: string; tagline: string | null; description: string | null };
type Doctor = { id: string; full_name: string; referral_code: string; has_isotretinoin_access: boolean };
type Ambassador = { id: string; full_name: string; referral_code: string; referral_count: number };
type SaleRecord = { id: string; folio: string; sale_date: string; note: string | null; doctors: { full_name: string } | null; ambassadors: { full_name: string } | null };

type RoutineItem = { id: string; step_note: string | null; sort_order: number; products: Product };
type Routine = { id: string; title: string; description: string | null; routine_items: RoutineItem[] } | null;
type MonthlyFeature = {
  id: string;
  month_label: string;
  concept_title: string;
  concept_description: string | null;
  routines: Routine;
} | null;
type Duo = { id: string; note: string | null; product_a: { id: number; title: string; image_url: string | null } | null; product_b: { id: number; title: string; image_url: string | null } | null };
type MonthlyPromotion = { id: string; title: string; description: string | null };

export default function VendedoraPanelClient({
  sellerId,
  sellerCity,
  promoted,
  allProducts,
  materials,
  brands,
  doctors,
  ambassadors,
  saleRecords,
  monthlyFeature,
  duos,
  promotions,
  copy,
}: {
  sellerId: string;
  sellerCity: string | null;
  promoted: Promoted[];
  allProducts: Product[];
  materials: Material[];
  brands: Brand[];
  doctors: Doctor[];
  ambassadors: Ambassador[];
  saleRecords: SaleRecord[];
  monthlyFeature: MonthlyFeature;
  duos: Duo[];
  promotions: MonthlyPromotion[];
  copy: Record<string, string>;
}) {
  const [tab, setTab] = useState<'delmes' | 'buscar' | 'referidos' | 'capacitaciones'>('delmes');
  const [query, setQuery] = useState('');
  const [browseType, setBrowseType] = useState<'ingrediente' | 'problema'>('ingrediente');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const cityScoped = useMemo(() => {
    if (!sellerCity) return allProducts;
    return allProducts.filter((p) => !p.available_cities || p.available_cities.includes(sellerCity));
  }, [allProducts, sellerCity]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cityScoped.filter((p) => {
      const haystack = [
        p.title,
        p.vendor,
        p.highlight_ingredient,
        p.highlight_benefit,
        ...(p.needs ?? []),
        ...(p.key_ingredients ?? []).map((k) => k.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [cityScoped, query]);

  // ---- Buscar alternativa: vista por ingrediente / por padecimiento ----
  const ingredientEntries = useMemo(() => {
    const counts = new Map<string, number>();
    cityScoped.forEach((p) => {
      (p.key_ingredients ?? []).forEach((k) => {
        const name = k.name?.trim();
        if (!name) return;
        counts.set(name, (counts.get(name) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], 'es'));
  }, [cityScoped]);

  const needEntries = useMemo(() => {
    const counts = new Map<string, number>();
    cityScoped.forEach((p) => {
      (p.needs ?? []).forEach((n) => {
        const name = n?.trim();
        if (!name) return;
        counts.set(name, (counts.get(name) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], 'es'));
  }, [cityScoped]);

  const categoryResults = useMemo(() => {
    if (!selectedCategory) return [];
    if (browseType === 'ingrediente') {
      return cityScoped.filter((p) => (p.key_ingredients ?? []).some((k) => k.name?.trim() === selectedCategory));
    }
    return cityScoped.filter((p) => (p.needs ?? []).some((n) => n?.trim() === selectedCategory));
  }, [cityScoped, browseType, selectedCategory]);

  function concentrationFor(p: Product, ingredientName: string) {
    return (p.key_ingredients ?? []).find((k) => k.name?.trim() === ingredientName)?.concentration ?? null;
  }

  // ---- Referidos: búsqueda por nombre ----
  const [personQuery, setPersonQuery] = useState('');
  const [selected, setSelected] = useState<{ type: 'doctor' | 'ambassador'; id: string; name: string; code: string } | null>(null);

  const personResults = useMemo(() => {
    const q = personQuery.trim().toLowerCase();
    if (!q) return [];
    const docs = doctors
      .filter((d) => d.full_name.toLowerCase().includes(q) || d.referral_code.toLowerCase().includes(q))
      .map((d) => ({ type: 'doctor' as const, id: d.id, name: d.full_name, code: d.referral_code }));
    const ambs = ambassadors
      .filter((a) => a.full_name.toLowerCase().includes(q) || a.referral_code.toLowerCase().includes(q))
      .map((a) => ({ type: 'ambassador' as const, id: a.id, name: a.full_name, code: a.referral_code }));
    return [...docs, ...ambs];
  }, [personQuery, doctors, ambassadors]);

  const selectedDoctor = selected?.type === 'doctor' ? doctors.find((d) => d.id === selected.id) : null;
  const selectedAmbassador = selected?.type === 'ambassador' ? ambassadors.find((a) => a.id === selected.id) : null;

  const [folio, setFolio] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  function submitReferral(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const formData = new FormData();
    formData.set('folio', folio);
    formData.set('sale_date', saleDate);
    formData.set('referred_doctor_id', selected.type === 'doctor' ? selected.id : '');
    formData.set('referred_ambassador_id', selected.type === 'ambassador' ? selected.id : '');
    formData.set('note', note);
    startTransition(() => {
      createSellerReferral(sellerId, formData);
    });
    setFolio('');
    setNote('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function submitDirectSale(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set('folio', folio);
    formData.set('sale_date', saleDate);
    formData.set('referred_doctor_id', '');
    formData.set('referred_ambassador_id', '');
    formData.set('note', note);
    startTransition(() => {
      createSellerReferral(sellerId, formData);
    });
    setFolio('');
    setNote('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div className="category-tabs">
        <button className={`tab ${tab === 'delmes' ? 'active' : ''}`} onClick={() => setTab('delmes')}>Del mes</button>
        <button className={`tab ${tab === 'buscar' ? 'active' : ''}`} onClick={() => setTab('buscar')}>Buscar alternativa</button>
        <button className={`tab ${tab === 'referidos' ? 'active' : ''}`} onClick={() => setTab('referidos')}>Referidos</button>
        <button className={`tab ${tab === 'capacitaciones' ? 'active' : ''}`} onClick={() => setTab('capacitaciones')}>Capacitaciones</button>
      </div>

      {tab === 'delmes' && (
        <div>
          {monthlyFeature ? (
            <div className="panel-card">
              <div className="admin-note" style={{ marginBottom: 4 }}>{monthlyFeature.month_label}</div>
              <h2 style={{ marginBottom: 8 }}>{monthlyFeature.concept_title}</h2>
              {monthlyFeature.concept_description && (
                <p className="commission-note" style={{ marginBottom: 20 }}>{monthlyFeature.concept_description}</p>
              )}

              {monthlyFeature.routines && (
                <div style={{ marginBottom: 24 }}>
                  <div className="step-group-title">Rutina del mes: {monthlyFeature.routines.title}</div>
                  {monthlyFeature.routines.description && (
                    <p className="commission-note" style={{ marginBottom: 12 }}>{monthlyFeature.routines.description}</p>
                  )}
                  <div className="product-grid">
                    {[...monthlyFeature.routines.routine_items]
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((ri) => (
                        <div key={ri.id} className="product-card" style={{ cursor: 'default' }}>
                          {ri.products.image_url && (
                            <Image src={ri.products.image_url} alt={ri.products.title} width={300} height={300} unoptimized />
                          )}
                          <div className="product-card-info">
                            <div className="product-card-title">{ri.products.title}</div>
                            {ri.step_note && <div className="product-card-vendor">{ri.step_note}</div>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {duos.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="step-group-title">Dúos recomendados</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {duos.map((d) => (
                      <div key={d.id} className="catalog-editor-row">
                        <span className="catalog-editor-row-title">
                          {d.product_a?.title} + {d.product_b?.title}
                          {d.note && <span className="catalog-brand-tag">{d.note}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {promotions.length > 0 && (
                <div>
                  <div className="step-group-title">Promociones activas</div>
                  <div className="commission-list">
                    {promotions.map((p) => (
                      <div key={p.id} className="commission-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                        <strong style={{ fontSize: 14 }}>{p.title}</strong>
                        {p.description && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{p.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="panel-card">
              <p className="results-placeholder">Todavía no hay un mes armado. Pregunta a tu contacto en Propiel.</p>
            </div>
          )}

          {promoted.length > 0 && (
            <div className="panel-card">
              <h2>Otros productos destacados</h2>
              <div className="product-grid">
                {promoted.map((p) => (
                  <div key={p.id} className="product-card" style={{ cursor: 'default' }}>
                    {p.products?.image_url && (
                      <Image src={p.products.image_url} alt={p.products.title} width={300} height={300} unoptimized />
                    )}
                    <div className="product-card-info">
                      <div className="product-card-title">{p.products?.title}</div>
                      {p.products?.vendor && <div className="product-card-vendor">{p.products.vendor}</div>}
                      {p.note && <div style={{ fontSize: 10, color: 'var(--muted)' }}>{p.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'buscar' && (
        <div className="panel-card">
          <h2>Buscar alternativa por ingrediente o padecimiento</h2>
          <p className="admin-note" style={{ marginBottom: 12 }}>
            Si el cliente pide un producto agotado (ej. "la Vitamina C de Obagi" o "ácido azelaico al 15%"),
            busca aquí por texto, o explora por ingrediente o padecimiento{sellerCity ? ` — opciones disponibles en tu sucursal (${sellerCity === 'MTY' ? 'Monterrey' : sellerCity})` : ''}.
          </p>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (e.target.value.trim() !== '') setSelectedCategory(null); }}
            placeholder="ej. vitamina C, acné, hidratación..."
            style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', width: '100%', maxWidth: 420, marginBottom: 16 }}
          />

          {query.trim() !== '' ? (
            searchResults.length === 0 ? (
              <p className="results-placeholder">No encontré productos con eso. Intenta con otra palabra.</p>
            ) : (
              <div className="product-grid">
                {searchResults.map((p) => (
                  <div key={p.id} className="product-card" style={{ cursor: 'default' }}>
                    {p.image_url && <Image src={p.image_url} alt={p.title} width={300} height={300} unoptimized />}
                    <div className="product-card-info">
                      <div className="product-card-title">{p.title}</div>
                      {p.vendor && <div className="product-card-vendor">{p.vendor}</div>}
                      {p.price != null && (
                        <div className="product-card-price">${Number(p.price).toLocaleString('es-MX')} {p.currency ?? 'MXN'}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : selectedCategory ? (
            <div>
              <button type="button" className="category-back-btn" onClick={() => setSelectedCategory(null)}>
                ← Volver a {browseType === 'ingrediente' ? 'ingredientes' : 'padecimientos'}
              </button>
              <div className="step-group-title" style={{ marginBottom: 12 }}>{selectedCategory} · {categoryResults.length} producto{categoryResults.length !== 1 ? 's' : ''}</div>
              {categoryResults.length === 0 ? (
                <p className="results-placeholder">No hay productos disponibles en tu sucursal para esta categoría.</p>
              ) : (
                <div className="product-grid">
                  {categoryResults.map((p) => {
                    const conc = browseType === 'ingrediente' ? concentrationFor(p, selectedCategory) : null;
                    return (
                      <div key={p.id} className="product-card" style={{ cursor: 'default' }}>
                        {p.image_url && <Image src={p.image_url} alt={p.title} width={300} height={300} unoptimized />}
                        <div className="product-card-info">
                          <div className="product-card-title">{p.title}</div>
                          {p.vendor && <div className="product-card-vendor">{p.vendor}</div>}
                          {conc && <div className="product-card-concentration">{selectedCategory} {conc}</div>}
                          {p.price != null && (
                            <div className="product-card-price">${Number(p.price).toLocaleString('es-MX')} {p.currency ?? 'MXN'}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="browse-subtabs">
                <button
                  type="button"
                  className={`browse-subtab ${browseType === 'ingrediente' ? 'active' : ''}`}
                  onClick={() => setBrowseType('ingrediente')}
                >
                  Por ingrediente
                </button>
                <button
                  type="button"
                  className={`browse-subtab ${browseType === 'problema' ? 'active' : ''}`}
                  onClick={() => setBrowseType('problema')}
                >
                  Por padecimiento
                </button>
              </div>
              {(browseType === 'ingrediente' ? ingredientEntries : needEntries).length === 0 ? (
                <p className="results-placeholder">Todavía no hay productos categorizados para esta vista.</p>
              ) : (
                <div className="category-grid">
                  {(browseType === 'ingrediente' ? ingredientEntries : needEntries).map(([name, count], i) => (
                    <button
                      key={name}
                      type="button"
                      className="category-card"
                      style={{ background: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }}
                      onClick={() => setSelectedCategory(name)}
                    >
                      <span className="category-card-name">{name}</span>
                      <span className="category-card-count">{count} producto{count !== 1 ? 's' : ''}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'referidos' && (
        <div>
          <div className="panel-card">
            <h2>Buscar médico o embajadora</h2>
            <p className="admin-note" style={{ marginBottom: 12 }}>
              Si el cliente dice "vengo de parte de X", búscalo aquí por nombre o código.
            </p>
            <input
              value={personQuery}
              onChange={(e) => { setPersonQuery(e.target.value); setSelected(null); }}
              placeholder="Nombre o código..."
              style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', width: '100%', maxWidth: 420, marginBottom: 12 }}
            />
            {personQuery.trim() !== '' && personResults.length === 0 && (
              <p className="results-placeholder">No encontré a nadie con ese nombre o código.</p>
            )}
            {personResults.length > 0 && !selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {personResults.map((r) => (
                  <div className="catalog-editor-row" key={`${r.type}-${r.id}`}>
                    <span className="catalog-editor-row-title">
                      {r.name}
                      <span className="catalog-brand-tag">{r.type === 'doctor' ? 'Médico' : 'Embajadora'} · {r.code}</span>
                    </span>
                    <button className="btn-secondary" onClick={() => setSelected(r)} type="button">Seleccionar</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selected && selectedDoctor && (
            <div className="panel-card">
              <h2>{selectedDoctor.full_name} · Médico</h2>
              <div className="commission-list">
                <div className="commission-row"><span>Marcas Exclusivas</span><span className="commission-value">{copy.doctor_commission_exclusive_note}</span></div>
                <div className="commission-row"><span>Marcas Generales</span><span className="commission-value">{copy.doctor_commission_general_note}</span></div>
                {selectedDoctor.has_isotretinoin_access && (
                  <div className="commission-row"><span>Isotretinoína</span><span className="commission-value">Sin comisión · descuento al paciente</span></div>
                )}
              </div>
              <p className="commission-note" style={{ fontStyle: 'italic' }}>{copy.disclaimer_no_acumulable}</p>

              <form onSubmit={submitReferral} className="admin-form" style={{ marginTop: 16 }}>
                <label>Folio de Microsip<input value={folio} onChange={(e) => setFolio(e.target.value)} required /></label>
                <label>Fecha<input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} /></label>
                <label>Nota (opcional)<input value={note} onChange={(e) => setNote(e.target.value)} /></label>
                <p className="admin-note">Solo el folio — el monto de la venta lo agrega el equipo de administración para calcular la comisión.</p>
                <button type="submit" className="btn-primary">Registrar folio</button>
                {saved && <p style={{ color: 'var(--success)', fontSize: 13 }}>Guardado ✓</p>}
              </form>
            </div>
          )}

          {selected && selectedAmbassador && (
            <div className="panel-card">
              <h2>{selectedAmbassador.full_name} · Embajadora</h2>
              <div className="commission-list">
                <div className="commission-row">
                  <span>Nivel actual ({selectedAmbassador.referral_count} referidos)</span>
                  <span className="commission-value">{selectedAmbassador.referral_count >= 40 ? 18 : 15}%</span>
                </div>
              </div>
              <p className="commission-note">{copy.ambassador_referred_discount_note}</p>
              <p className="commission-note" style={{ fontStyle: 'italic' }}>{copy.disclaimer_no_acumulable}</p>

              <form onSubmit={submitReferral} className="admin-form" style={{ marginTop: 16 }}>
                <label>Folio de Microsip<input value={folio} onChange={(e) => setFolio(e.target.value)} required /></label>
                <label>Fecha<input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} /></label>
                <label>Nota (opcional)<input value={note} onChange={(e) => setNote(e.target.value)} /></label>
                <p className="admin-note">Solo cuenta como +1 referido para su nivel — no hace falta monto.</p>
                <button type="submit" className="btn-primary">Registrar folio</button>
                {saved && <p style={{ color: 'var(--success)', fontSize: 13 }}>Guardado ✓</p>}
              </form>
            </div>
          )}

          <div className="panel-card">
            <h2>Venta directa (sin referido)</h2>
            <p className="admin-note" style={{ marginBottom: 12 }}>Si la venta no viene de ningún médico o embajadora, solo registra el folio aquí.</p>
            <form onSubmit={submitDirectSale} className="admin-form">
              <label>Folio de Microsip<input value={folio} onChange={(e) => setFolio(e.target.value)} required /></label>
              <label>Fecha<input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} /></label>
              <label>Nota (opcional)<input value={note} onChange={(e) => setNote(e.target.value)} /></label>
              <button type="submit" className="btn-primary">Registrar</button>
            </form>
          </div>

          {saleRecords.length > 0 && (
            <div className="panel-card">
              <h2>Tus últimos folios registrados</h2>
              <table className="sales-table">
                <thead><tr><th>Fecha</th><th>Folio</th><th>Referido</th><th>Nota</th></tr></thead>
                <tbody>
                  {saleRecords.map((s) => (
                    <tr key={s.id}>
                      <td>{new Date(s.sale_date).toLocaleDateString('es-MX')}</td>
                      <td>{s.folio}</td>
                      <td>{s.doctors?.full_name ?? s.ambassadors?.full_name ?? '— directa —'}</td>
                      <td>{s.note ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'capacitaciones' && (
        <div className="panel-card">
          <h2>Capacitaciones</h2>
          {materials.length > 0 ? (
            <div className="catalog-editor-group">
              {materials.map((m) => (
                <div className="catalog-editor-row" key={m.id}>
                  <span className="catalog-editor-row-title">
                    {m.title}
                    {m.category && <span className="catalog-brand-tag">{m.category}</span>}
                  </span>
                  <a href={m.file_url} target="_blank" rel="noreferrer" className="admin-product-link">Ver / descargar</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="results-placeholder" style={{ marginBottom: 16 }}>Todavía no hay archivos de capacitación subidos.</p>
          )}
          <div className="brand-grid" style={{ marginTop: 16 }}>
            {brands.map((b) => (
              <div key={b.slug} className="brand-card">
                <div className="brand-card-name">{b.name}</div>
                {b.tagline && <div className="brand-card-tagline">{b.tagline}</div>}
                {b.description && <p style={{ fontSize: 13, color: 'var(--muted)' }}>{b.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
