'use client';
import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { setAmbassadorCatalogItem } from '../../actions';
type Product = { id: number; title: string; step_label: string | null; step_order: number | null; brand_slug: string | null };
type CatalogItem = { product_id: number; is_featured_this_month: boolean };
export default function AmbassadorCatalogEditor({ ambassadorId, products, catalogItems }: { ambassadorId: string; products: Product[]; catalogItems: CatalogItem[] }) {
  const [, startTransition] = useTransition();
  const initialMap = new Map(catalogItems.map((c) => [c.product_id, c.is_featured_this_month]));
  const [state, setState] = useState<Map<number, { inCatalog: boolean; isFeatured: boolean }>>(() => new Map(products.map((p) => [p.id, { inCatalog: initialMap.has(p.id), isFeatured: initialMap.get(p.id) ?? false }])));
  const groups = useMemo(() => { const map = new Map<string, Product[]>(); products.forEach((p) => { const label = p.step_label ?? 'Otros'; if (!map.has(label)) map.set(label, []); map.get(label)!.push(p); }); return Array.from(map.entries()); }, [products]);
  function toggleInCatalog(productId: number) { const current = state.get(productId) ?? { inCatalog: false, isFeatured: false }; const next = { inCatalog: !current.inCatalog, isFeatured: current.isFeatured }; setState(new Map(state).set(productId, next)); startTransition(() => { setAmbassadorCatalogItem(ambassadorId, productId, next.inCatalog, next.isFeatured); }); }
  function toggleFeatured(productId: number) { const current = state.get(productId) ?? { inCatalog: false, isFeatured: false }; const next = { inCatalog: current.inCatalog, isFeatured: !current.isFeatured }; setState(new Map(state).set(productId, next)); startTransition(() => { setAmbassadorCatalogItem(ambassadorId, productId, next.inCatalog, next.isFeatured); }); }
  return (
    <div>
      {groups.map(([label, groupProducts]) => (
        <div className="catalog-editor-group" key={label}>
          <div className="catalog-editor-group-title">{label}</div>
          {groupProducts.map((p) => { const s = state.get(p.id) ?? { inCatalog: false, isFeatured: false }; return (
            <div className="catalog-editor-row" key={p.id}>
              <span className="catalog-editor-row-title">{p.title}{p.brand_slug && <span className="catalog-brand-tag">Marca exclusiva</span>}<Link href={`/admin/products/${p.id}`} className="admin-product-link">editar producto</Link></span>
              <label className="catalog-editor-checkbox"><input type="checkbox" checked={s.inCatalog} onChange={() => toggleInCatalog(p.id)} />En catálogo</label>
              <label className="catalog-editor-checkbox"><input type="checkbox" checked={s.isFeatured} disabled={!s.inCatalog} onChange={() => toggleFeatured(p.id)} />Destacado este mes</label>
            </div>
          ); })}
        </div>
      ))}
    </div>
  );
}
