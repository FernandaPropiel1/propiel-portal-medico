import { createClient } from '@/lib/supabase/server';
import { DEFAULT_COPY, COPY_LABELS } from '@/lib/siteCopy';
import SiteCopyEditor from './SiteCopyEditor';
export const dynamic = 'force-dynamic';
export default async function AdminCopyPage() {
  const supabase = createClient();
  const { data: rows } = await supabase.from('site_copy').select('*');
  const rowMap = new Map((rows ?? []).map((r) => [r.key, r.value]));
  const items = Object.keys(DEFAULT_COPY).map((key) => ({ key, label: COPY_LABELS[key] ?? key, value: rowMap.has(key) ? rowMap.get(key) : DEFAULT_COPY[key] }));
  return (
    <div className="page-container">
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Textos editables</h1>
      <p className="admin-note" style={{ marginBottom: 20 }}>Estos son los textos y avisos que aparecen en los paneles de médico y embajadora.</p>
      <div className="panel-card"><SiteCopyEditor items={items} /></div>
    </div>
  );
}
