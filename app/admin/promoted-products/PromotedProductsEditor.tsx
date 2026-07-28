'use client';
import { useState, useTransition } from 'react';
import { setPromotedProduct } from '../actions';
type Product = { id: number; title: string; vendor: string | null };
type Promoted = { product_id: number; note: string | null };
export default function PromotedProductsEditor({ products, promoted }: { products: Product[]; promoted: Promoted[] }) {
  const [, startTransition] = useTransition();
  const initialMap = new Map(promoted.map((p) => [p.product_id, p.note ?? '']));
  const [state, setState] = useState<Map<number, { checked: boolean; note: string }>>(() => new Map(products.map((p) => [p.id, { checked: initialMap.has(p.id), note: initialMap.get(p.id) ?? '' }])));
  function toggle(productId: number) { const current = state.get(productId) ?? { checked: false, note: '' }; const next = { checked: !current.checked, note: current.note }; setState(new Map(state).set(productId, next)); startTransition(() => { setPromotedProduct(productId, next.checked, next.note); }); }
  function updateNote(productId: number, note: string) { setState(new Map(state).set(productId, { ...(state.get(productId) ?? { checked: false, note: '' }), note })); }
  function saveNote(productId: number) { const current = state.get(productId); if (!current) return; startTransition(() => { setPromotedProduct(productId, current.checked, current.note); }); }
  return (
    <div>
      {products.map((p) => { const s = state.get(p.id) ?? { checked: false, note: '' }; return (
        <div className="catalog-editor-row" key={p.id}>
          <span className="catalog-editor-row-title">{p.title}{p.vendor ? ` · ${p.vendor}` : ''}</span>
          <input placeholder="nota (opcional)" value={s.note} onChange={(e) => updateNote(p.id, e.target.value)} onBlur={() => saveNote(p.id)} style={{ maxWidth: 200, border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px' }} />
          <label className="catalog-editor-checkbox"><input type="checkbox" checked={s.checked} onChange={() => toggle(p.id)} />Promover</label>
        </div>
      ); })}
    </div>
  );
}
