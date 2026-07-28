'use client';
import { useMemo, useState, useTransition } from 'react';
import { setRoutineItem } from '../../actions';
type Product = { id: number; title: string; step_label: string | null; step_order: number | null; brand_slug: string | null };
type RoutineItem = { product_id: number; step_note: string | null; sort_order: number };
export default function RoutineItemsEditor({ routineId, products, routineItems }: { routineId: string; products: Product[]; routineItems: RoutineItem[] }) {
  const [, startTransition] = useTransition();
  const initialMap = new Map(routineItems.map((r) => [r.product_id, { note: r.step_note ?? '', order: r.sort_order }]));
  const [state, setState] = useState<Map<number, { included: boolean; note: string; order: number }>>(() => new Map(products.map((p) => [p.id, { included: initialMap.has(p.id), note: initialMap.get(p.id)?.note ?? '', order: initialMap.get(p.id)?.order ?? 0 }])));
  const nextOrder = useMemo(() => { let max = 0; state.forEach((s) => { if (s.included && s.order > max) max = s.order; }); return max + 1; }, [state]);
  function toggle(productId: number) { const current = state.get(productId) ?? { included: false, note: '', order: 0 }; const included = !current.included; const order = included ? nextOrder : current.order; const next = { included, note: current.note, order }; setState(new Map(state).set(productId, next)); startTransition(() => { setRoutineItem(routineId, productId, included, next.note, order); }); }
  function updateNote(productId: number, note: string) { setState(new Map(state).set(productId, { ...(state.get(productId) ?? { included: false, note: '', order: 0 }), note })); }
  function saveNote(productId: number) { const current = state.get(productId); if (!current || !current.included) return; startTransition(() => { setRoutineItem(routineId, productId, true, current.note, current.order); }); }
  const groups = useMemo(() => { const map = new Map<string, Product[]>(); products.forEach((p) => { const label = p.step_label ?? 'Otros'; if (!map.has(label)) map.set(label, []); map.get(label)!.push(p); }); return Array.from(map.entries()); }, [products]);
  return (
    <div>
      {groups.map(([label, groupProducts]) => (
        <div className="catalog-editor-group" key={label}>
          <div className="catalog-editor-group-title">{label}</div>
          {groupProducts.map((p) => { const s = state.get(p.id) ?? { included: false, note: '', order: 0 }; return (
            <div className="catalog-editor-row" key={p.id}>
              <span className="catalog-editor-row-title">{p.title}{p.brand_slug && <span className="catalog-brand-tag">Marca exclusiva</span>}{s.included && <span className="catalog-brand-tag">Paso {s.order}</span>}</span>
              {s.included && (<input placeholder="nota del paso (opcional)" value={s.note} onChange={(e) => updateNote(p.id, e.target.value)} onBlur={() => saveNote(p.id)} style={{ maxWidth: 220, border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px' }} />)}
              <label className="catalog-editor-checkbox"><input type="checkbox" checked={s.included} onChange={() => toggle(p.id)} />Incluir en rutina</label>
            </div>
          ); })}
        </div>
      ))}
    </div>
  );
}
