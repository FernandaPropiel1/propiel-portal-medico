'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { resolveHomePath } from '@/lib/roles';
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError('Correo o contraseña incorrectos.'); return; }
    const homePath = await resolveHomePath(supabase);
    router.push(homePath); router.refresh();
  }
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Propiel · Portal Médico</h1>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>Correo<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Contraseña<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
