import Link from 'next/link';
export default function AdminNav() {
  return (
    <div style={{ display: 'flex', gap: 20, maxWidth: 1100, margin: '0 auto', padding: '20px 32px 0', fontSize: 14 }}>
      <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Médicos</Link>
      <Link href="/admin/ambassadors" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Embajadoras</Link>
      <Link href="/admin/sellers" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Vendedoras</Link>
      <Link href="/admin/products" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Productos</Link>
      <Link href="/admin/promoted-products" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Promover</Link>
      <Link href="/admin/routines" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Rutinas</Link>
      <Link href="/admin/training" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Capacitaciones</Link>
      <Link href="/admin/copy" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Textos</Link>
      <Link href="/admin/seller-sales" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Folios</Link>
      <Link href="/admin/monthly" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Del mes</Link>
      <Link href="/catalogo" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Ver catálogo</Link>
    </div>
  );
}
