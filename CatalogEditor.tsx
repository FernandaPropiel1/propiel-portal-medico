'use client';
import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { setCatalogItem } from '../../actions';
type Product = { id: number; title: string; step_label: string | null; step_order: number | null; brand_slug: string | null };
type CatalogItem = { product_id: number; is_new_launch: boolean };
export default function CatalogEditor({ doctorId, products, catalogItems }: { doctorId: string; products: Product[]; catalogItems: CatalogItem[] }) {
  const [, startTransition] = useTransition();
  const initialMap = new Map(catalogItems.map((c) => [c.product_id, c.is_new_launch]));
  const [state, setState] = useState<Map<number, { inCatalog: boolean; isNew: boolean }>>(() => new Map(products.map((p) => [p.id, { inCatalog: initialMap.has(p.id), isNew: initialMap.get(p.id) ?? false }])));
  const groups = useMemo(() => { const map = new Map<string, Product[]>(); products.forEach((p) => { const label = p.step_label ?? 'Otros'; if (!map.has(label)) map.set(label, []); map.get(label)!.push(p); }); return Array.from(map.entries()); }, [products]);
  function toggleInCatalog(productId: number) { const current = state.get(productId) ?? { inCatalog: false, isNew: false }; const next = { inCatalog: !current.inCatalog, isNew: current.isNew }; setState(new Map(state).set(productId, next)); startTransition(() => { setCatalogItem(doctorId, productId, next.inCatalog, next.isNew); }); }
  function toggleNewLaunch(productId: number) { const current = state.get(productId) ?? { inCatalog: false, isNew: false }; const next = { inCatalog: current.inCatalog, isNew: !current.isNew }; setState(new Map(state).set(productId, next)); startTransition(() => { setCatalogItem(doctorId, productId, next.inCatalog, next.isNew); }); }
  return (
    <div>
      {groups.map(([label, groupProducts]) => (
        <div className="catalog-editor-group" key={label}>
          <div className="catalog-editor-group-title">{label}</div>
          {groupProducts.map((p) => { const s = state.get(p.id) ?? { inCatalog: false, isNew: false }; return (
            <div className="catalog-editor-row" key={p.id}>
              <span className="catalog-editor-row-title">{p.title}{p.brand_slug && <span className="catalog-brand-tag">Marca exclusiva</span>}<Link href={`/admin/products/${p.id}`} className="admin-product-link">editar producto</Link></span>
              <label className="catalog-editor-checkbox"><input type="checkbox" checked={s.inCatalog} onChange={() => toggleInCatalog(p.id)} />En catálogo</label>
              <label className="catalog-editor-checkbox"><input type="checkbox" checked={s.isNew} disabled={!s.inCatalog} onChange={() => toggleNewLaunch(p.id)} />Producto destacado</label>
            </div>
          ); })}
        </div>
      ))}
    </div>
  );
}
