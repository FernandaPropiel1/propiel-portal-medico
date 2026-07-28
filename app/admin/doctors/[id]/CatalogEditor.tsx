'use client';
import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { setCatalogItem } from '../../actions';
export default function CatalogEditor({ doctorId, products, catalogItems }) {
  const [, startTransition] = useTransition();
  const initialMap = new Map(catalogItems.map((c) => [c.product_id, c.is_new_launch]));
  const [state, setState] = useState(() => new Map(products.map((p) => [p.id, { inCatalog: initialMap.has(p.id), isNew: initialMap.get(p.id) ?? false }])));
  const groups = useMemo(() => { const map = new Map(); products.forEach((p) => { const label = p.step_label ?? 'Otros'; if (!map.has(label)) map.set(label, []); map.get(label).push(p); }); return Array.from(map.entries()); }, [products]);
  function toggleInCatalog(productId) { const current = state.get(productId) ?? { inCatalog: false, isNew: false }; const next = { inCatalog: !current.inCatalog, isNew: current.isNew }; setState(new Map(state).set(productId, next)); startTransition(() => { setCatalogItem(doctorId, productId, next.inCatalog, next.isNew); }); }
  function toggleNewLaunch(productId) { const current = state.get(productId) ?? { inCatalog: false, isNew: false }; const next = { inCatalog: current.inCatalog, isNew: !current.isNew }; setState(new Map(state).set(productId, next)); startTransition(() => { setCatalogItem(doctorId, productId, next.inCatalog, next.isNew); }); }
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
