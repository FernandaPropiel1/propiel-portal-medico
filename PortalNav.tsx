import Link from 'next/link';
import SignOutButton from './SignOutButton';
export default function PortalNav({ doctorName, isAdmin, navItems }: { doctorName: string; isAdmin?: boolean; navItems?: { href: string; label: string }[] }) {
  const items = navItems ?? [{ href: '/catalogo', label: 'Catálogo' }, { href: '/panel', label: 'Mi panel' }];
  return (
    <nav className="portal-nav">
      <div className="portal-nav-brand">Propiel</div>
      <div className="portal-nav-links">{items.map((item) => (<Link key={item.href} href={item.href}>{item.label}</Link>))}{isAdmin && <Link href="/admin">Admin</Link>}</div>
      <div className="portal-nav-user"><span className="portal-nav-user-name">{doctorName}</span><SignOutButton /></div>
    </nav>
  );
}
