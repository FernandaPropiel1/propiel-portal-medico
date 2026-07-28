'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createTrainingMaterial } from '../actions';
export default function TrainingUploader() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [audience, setAudience] = useState('sellers');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError('Selecciona un archivo.'); return; }
    setError(null); setUploading(true);
    try {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from('training-materials').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from('training-materials').getPublicUrl(path);
      const formData = new FormData();
      formData.set('title', title); formData.set('category', category); formData.set('audience', audience); formData.set('file_url', pub.publicUrl); formData.set('file_name', file.name); formData.set('storage_path', path);
      await createTrainingMaterial(formData);
      setTitle(''); setCategory(''); setFile(null);
      router.refresh();
    } catch (err) { setError(err.message ?? 'Error al subir el archivo.'); } finally { setUploading(false); }
  }
  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <label>Título<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
      <label>Categoría (opcional)<input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="ej. Marca propia, Ventas" /></label>
      <label>Audiencia
        <select value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="sellers">Vendedoras</option><option value="doctors">Médicos</option><option value="ambassadors">Embajadoras</option><option value="all">Todas</option>
        </select>
      </label>
      <label>Archivo<input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required /></label>
      <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'Subiendo…' : 'Subir archivo'}</button>
      {error && <p className="login-error">{error}</p>}
    </form>
  );
}
