'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Product = {
  id: number;
  title: string;
  vendor: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  needs: string[] | null;
  skin_types: string[] | null;
  product_subtype: string | null;
  step_label: string | null;
  step_order: number | null;
  brand_slug: string | null;
};

type CatalogItem = {
  id: string;
  is_new_launch: boolean;
  products: Product;
};

type Brand = { slug: string; name: string; tagline: string | null };

function ProductCard({ item }: { item: CatalogItem }) {
  const p = item.products;
  return (
    <Link href={`/catalogo/${p.id}`} className="product-card">
      {item.is_new_launch && <span className="badge-new">Destacado</span>}
      {p.image_url && (
        <Image src={p.image_url} alt={p.title} width={300} height={300} unoptimized />
      )}
      {p.brand_slug && <span className="badge-exclusive-inline">Marca exclusiva</span>}
      <div className="product-card-info">
        <div className="product-card-title">{p.title}</div>
        {p.vendor && <div className="product-card-vendor">{p.vendor}</div>}
        {p.price != null && (
          <div className="product-card-price">
            ${Number(p.price).toLocaleString('es-MX')} {p.currency ?? 'MXN'}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function CatalogoClient({
  items,
  brands,
}: {
  items: CatalogItem[];
  brands: Brand[];
}) {
  const steps = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      const label = it.products.step_label ?? 'Otros';
      if (!map.has(label)) map.set(label, it.products.step_order ?? 99);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([label]) => label);
  }, [items]);

  const availableBrands = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((it) => {
      if (it.products.brand_slug) {
        counts.set(it.products.brand_slug, (counts.get(it.products.brand_slug) ?? 0) + 1);
      }
    });
    return brands
      .filter((b) => counts.has(b.slug))
      .map((b) => ({ ...b, count: counts.get(b.slug)! }));
  }, [items, brands]);

  const [activeTab, setActiveTab] = useState('todas');
  const [skinType, setSkinType] = useState<string | null>(null);
  const [need, setNeed] = useState<string | null>(null);
  const [subtype, setSubtype] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const isBrandsTab = activeTab === 'marcas';

  const scopedItems = useMemo(() => {
    if (activeTab === 'todas' || isBrandsTab) return items;
    return items.filter((it) => (it.products.step_label ?? 'Otros') === activeTab);
  }, [items, activeTab, isBrandsTab]);

  const availableSkinTypes = useMemo(() => {
    const set = new Set<string>();
    scopedItems.forEach((it) => it.products.skin_types?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [scopedItems]);

  const availableNeeds = useMemo(() => {
    const set = new Set<string>();
    scopedItems.forEach((it) => it.products.needs?.forEach((n) => set.add(n)));
    return Array.from(set).sort();
  }, [scopedItems]);

  const availableSubtypes = useMemo(() => {
    const set = new Set<string>();
    scopedItems.forEach((it) => { if (it.products.product_subtype) set.add(it.products.product_subtype); });
    return Array.from(set).sort();
  }, [scopedItems]);

  const filteredItems = useMemo(() => {
    return scopedItems.filter((it) => {
      if (skinType && !it.products.skin_types?.includes(skinType)) return false;
      if (need && !it.products.needs?.includes(need)) return false;
      if (subtype && it.products.product_subtype !== subtype) return false;
      return true;
    });
  }, [scopedItems, skinType, need, subtype]);

  const featured = items.filter((it) => it.is_new_launch);

  function selectTab(tab: string) {
    setActiveTab(tab);
    setSkinType(null);
    setNeed(null);
    setSubtype(null);
  }

  return (
    <div>
      {featured.length > 0 && activeTab === 'todas' && !skinType && !need && !subtype && (
        <div className="step-group">
          <div className="step-group-title">Producto Destacado</div>
          <div className="product-grid">
            {featured.map((it) => (
              <ProductCard key={it.id} item={it} />
            ))}
          </div>
        </div>
      )}

      <div className="category-tabs">
        <button className={`tab ${activeTab === 'todas' ? 'active' : ''}`} onClick={() => selectTab('todas')}>
          Todas
        </button>
        {steps.map((s) => (
          <button key={s} className={`tab ${activeTab === s ? 'active' : ''}`} onClick={() => selectTab(s)}>
            {s}
          </button>
        ))}
        {availableBrands.length > 0 && (
          <button className={`tab ${isBrandsTab ? 'active' : ''}`} onClick={() => selectTab('marcas')}>
            Marcas Exclusivas
          </button>
        )}
      </div>

      {!isBrandsTab && (availableSkinTypes.length > 0 || availableNeeds.length > 0 || availableSubtypes.length > 0) && (
        <button
          type="button"
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters((v) => !v)}
        >
          {showFilters ? 'Ocultar filtros' : 'Filtrar por piel / necesidad'}
          {(skinType || need || subtype) ? ' •' : ''}
        </button>
      )}

      {showFilters && !isBrandsTab && (availableSkinTypes.length > 0 || availableNeeds.length > 0 || availableSubtypes.length > 0) && (
        <div className="filter-bar">
          {availableSubtypes.length > 0 && (
            <div className="filter-group">
              <span className="filter-group-label">Tipo de producto:</span>
              {availableSubtypes.map((st) => (
                <button
                  key={st}
                  className={`chip ${subtype === st ? 'chip-active' : ''}`}
                  onClick={() => setSubtype(subtype === st ? null : st)}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
          {availableSkinTypes.length > 0 && (
            <div className="filter-group">
              <span className="filter-group-label">Tipo de piel:</span>
              {availableSkinTypes.map((s) => (
                <button
                  key={s}
                  className={`chip ${skinType === s ? 'chip-active' : ''}`}
                  onClick={() => setSkinType(skinType === s ? null : s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {availableNeeds.length > 0 && (
            <div className="filter-group">
              <span className="filter-group-label">Necesidad:</span>
              {availableNeeds.map((n) => (
                <button
                  key={n}
                  className={`chip ${need === n ? 'chip-active' : ''}`}
                  onClick={() => setNeed(need === n ? null : n)}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
          {(skinType || need || subtype) && (
            <button className="clear-filters" onClick={() => { setSkinType(null); setNeed(null); setSubtype(null); }}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {isBrandsTab ? (
        <div className="brand-grid">
          {availableBrands.map((b) => (
            <Link key={b.slug} href={`/catalogo/marcas/${b.slug}`} className="brand-card">
              <div className="brand-card-name">{b.name}</div>
              {b.tagline && <div className="brand-card-tagline">{b.tagline}</div>}
              <div className="brand-card-count">{b.count} producto{b.count !== 1 ? 's' : ''}</div>
            </Link>
          ))}
        </div>
      ) : activeTab === 'todas' && !skinType && !need && !subtype ? (
        steps.map((label) => {
          const groupItems = items.filter((it) => (it.products.step_label ?? 'Otros') === label);
          if (groupItems.length === 0) return null;
          return (
            <div className="step-group" key={label}>
              <div className="step-group-title">{label}</div>
              <div className="product-grid">
                {groupItems.map((it) => (
                  <ProductCard key={it.id} item={it} />
                ))}
              </div>
            </div>
          );
        })
      ) : filteredItems.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No hay productos con estos filtros todavía.</p>
      ) : (
        <div className="product-grid">
          {filteredItems.map((it) => (
            <ProductCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}
