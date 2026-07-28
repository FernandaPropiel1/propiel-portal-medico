'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Product = {
  id: number;
  title: string;
  vendor: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  step_label: string | null;
  step_order: number | null;
  brand_slug: string | null;
};

type CatalogItem = { id: string; is_featured_this_month: boolean; products: Product };

type RoutineItem = { id: string; step_note: string | null; sort_order: number; products: Product };
type Routine = { id: string; title: string; description: string | null; routine_items: RoutineItem[] };

function ProductCard({ item }: { item: CatalogItem }) {
  const p = item.products;
  return (
    <Link href={`/embajadora/producto/${p.id}`} className="product-card">
      {item.is_featured_this_month && <span className="badge-new">Destacado del mes</span>}
      {p.image_url && <Image src={p.image_url} alt={p.title} width={300} height={300} unoptimized />}
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

export default function EmbajadoraCatalogClient({ items, routines }: { items: CatalogItem[]; routines: Routine[] }) {
  const featured = items.filter((it) => it.is_featured_this_month);

  const groups = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      const label = it.products.step_label ?? 'Otros';
      if (!map.has(label)) map.set(label, it.products.step_order ?? 99);
    });
    return Array.from(map.entries()).sort((a, b) => a[1] - b[1]).map(([label]) => label);
  }, [items]);

  if (items.length === 0 && routines.length === 0) {
    return <p style={{ color: 'var(--muted)' }}>Todavía no tienes productos asignados en tu catálogo.</p>;
  }

  return (
    <div>
      {routines.length > 0 && (
        <div className="step-group">
          <div className="step-group-title">Rutinas recomendadas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {routines.map((r) => (
              <div key={r.id} className="panel-card" style={{ marginBottom: 0 }}>
                <h2 style={{ marginBottom: 6 }}>{r.title}</h2>
                {r.description && <p className="commission-note" style={{ marginBottom: 12 }}>{r.description}</p>}
                <div className="product-grid">
                  {[...r.routine_items]
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((ri) => (
                      <Link key={ri.id} href={`/embajadora/producto/${ri.products.id}`} className="product-card">
                        {ri.products.image_url && (
                          <Image src={ri.products.image_url} alt={ri.products.title} width={300} height={300} unoptimized />
                        )}
                        <div className="product-card-info">
                          <div className="product-card-title">{ri.products.title}</div>
                          {ri.step_note && <div className="product-card-vendor">{ri.step_note}</div>}
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {featured.length > 0 && (
        <div className="step-group">
          <div className="step-group-title">Destacado este mes</div>
          <div className="product-grid">
            {featured.map((it) => (<ProductCard key={it.id} item={it} />))}
          </div>
        </div>
      )}
      {groups.map((label) => {
        const groupItems = items.filter((it) => (it.products.step_label ?? 'Otros') === label);
        if (groupItems.length === 0) return null;
        return (
          <div className="step-group" key={label}>
            <div className="step-group-title">{label}</div>
            <div className="product-grid">
              {groupItems.map((it) => (<ProductCard key={it.id} item={it} />))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
