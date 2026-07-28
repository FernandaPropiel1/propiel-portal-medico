'use client';
import { useState, useTransition } from 'react';
import { updateSiteCopy } from '../actions';
export default function SiteCopyEditor({ items }) {
  const [, startTransition] = useTransition();
  const [state, setState] = useState(() => new Map(items.map((i) => [i.key, i.value])));
  const [savedKey, setSavedKey] = useState(null);
  function update(key, value) { setState(new Map(state).set(key, value)); }
  function save(key) { const value = state.get(key) ?? ''; startTransition(() => { updateSiteCopy(key, value); }); setSavedKey(key); setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 1500); }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {items.map((item) => (
        <label key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
          {item.label}
          {savedKey === item.key && <span style={{ color: 'var(--success)', fontSize: 12 }}>Guardado ✓</span>}
          <textarea value={state.get(item.key) ?? ''} onChange={(e) => update(item.key, e.target.value)} onBlur={() => save(item.key)} rows={2} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }} />
        </label>
      ))}
    </div>
  );
}
