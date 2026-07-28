'use client';
import { useState, useTransition } from 'react';
import { setCatalogItem, setAmbassadorCatalogItem } from '../../actions';
type Doctor = { id: string; full_name: string };
type Ambassador = { id: string; full_name: string };
export default function ProductAssignment({ productId, doctors, ambassadors, doctorIds, ambassadorIds }: { productId: number; doctors: Doctor[]; ambassadors: Ambassador[]; doctorIds: string[]; ambassadorIds: string[] }) {
  const [, startTransition] = useTransition();
  const [dSet, setDSet] = useState<Set<string>>(() => new Set(doctorIds));
  const [aSet, setASet] = useState<Set<string>>(() => new Set(ambassadorIds));
  function toggleDoctor(id: string) { const next = new Set(dSet); const inCatalog = !next.has(id); if (inCatalog) next.add(id); else next.delete(id); setDSet(next); startTransition(() => { setCatalogItem(id, productId, inCatalog, false); }); }
  function toggleAmbassador(id: string) { const next = new Set(aSet); const inCatalog = !next.has(id); if (inCatalog) next.add(id); else next.delete(id); setASet(next); startTransition(() => { setAmbassadorCatalogItem(id, productId, inCatalog, false); }); }
  return (
    <div>
      <div className="catalog-editor-group"><div className="catalog-editor-group-title">Médicos</div>
        {doctors.map((d) => (<div className="catalog-editor-row" key={d.id}><span className="catalog-editor-row-title">{d.full_name}</span><label className="catalog-editor-checkbox"><input type="checkbox" checked={dSet.has(d.id)} onChange={() => toggleDoctor(d.id)} />En catálogo</label></div>))}
        {doctors.length === 0 && <p className="admin-note">No hay médicos registrados todavía.</p>}
      </div>
      <div className="catalog-editor-group"><div className="catalog-editor-group-title">Embajadoras</div>
        {ambassadors.map((a) => (<div className="catalog-editor-row" key={a.id}><span className="catalog-editor-row-title">{a.full_name}</span><label className="catalog-editor-checkbox"><input type="checkbox" checked={aSet.has(a.id)} onChange={() => toggleAmbassador(a.id)} />En catálogo</label></div>))}
        {ambassadors.length === 0 && <p className="admin-note">No hay embajadoras registradas todavía.</p>}
      </div>
    </div>
  );
}
