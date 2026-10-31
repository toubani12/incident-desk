'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE } from '@/utils/labels';
import { initials } from '@/utils/format';

/** Liens affichés selon le rôle (simple confort visuel : le backend reste la vraie barrière). */
const LINKS = {
  EMPLOYEE: [
    { href: '/dashboard', label: 'Tableau de bord' },
    { href: '/incidents', label: 'Mes incidents' },
    { href: '/incidents/new', label: 'Déclarer' },
  ],
  TECHNICIAN: [
    { href: '/dashboard', label: 'Tableau de bord' },
    { href: '/assigned', label: 'Incidents affectés' },
  ],
  ADMIN: [
    { href: '/dashboard', label: 'Tableau de bord' },
    { href: '/admin/incidents', label: 'Incidents' },
    { href: '/admin/users', label: 'Utilisateurs' },
  ],
};

const PUBLIC_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/#fonctionnalites', label: 'Fonctionnalités' },
  { href: '/register', label: 'Créer un compte' },
];

export default function Navbar() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const links = user ? LINKS[user.role] || [] : PUBLIC_LINKS;
  const isActive = (href) =>
    href === pathname || (href !== '/' && !href.includes('#') && pathname.startsWith(href) &&
      !(href === '/incidents' && pathname === '/incidents/new'));

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className={`nav ${open ? 'open' : ''}`}>
      <div className="container nav-inner">
        <Link href={user ? '/dashboard' : '/'} className="brand" aria-label="Incident Desk">
          <span className="brand-mark" />
          Incident Desk
        </Link>

        <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className="nav-links">
          {ready && links.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link ${isActive(l.href) ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-right">
          {ready && user && (
            <>
              <Link href="/profile" className="user-chip" title="Mon profil">
                <span className="avatar sm">{initials(user.fullName)}</span>
                <span className="who">
                  <b>{user.fullName}</b>
                  <span>{ROLE[user.role]}</span>
                </span>
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Déconnexion
              </button>
            </>
          )}
          {ready && !user && (
            <Link href="/login" className="btn btn-outline btn-sm">Connexion</Link>
          )}
        </div>
      </div>
    </header>
  );
}
