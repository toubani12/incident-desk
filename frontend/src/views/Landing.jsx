'use client';

import Link from 'next/link';
import { Fingerprint, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ROLES = [
  {
    n: '01', title: 'Employé',
    items: ['Déclare un incident en quelques secondes', 'Suit l’état et l’historique', 'Ne voit que ses propres tickets'],
  },
  {
    n: '02', title: 'Technicien',
    items: ['Reçoit les incidents qui lui sont affectés', 'Fait évoluer le statut', 'Ajoute des notes de traitement'],
  },
  {
    n: '03', title: 'Administrateur',
    items: ['Affecte les incidents aux techniciens', 'Active / désactive les comptes', 'Pilote les statistiques globales'],
  },
];

const SECURITY = [
  { icon: Fingerprint, title: 'JWT signé HS256', text: 'Email, rôle, iat et exp dans le token' },
  { icon: ShieldCheck, title: 'Contrôle par rôle', text: 'hasRole + @PreAuthorize côté API' },
  { icon: KeyRound, title: 'BCrypt', text: 'Mots de passe jamais stockés en clair' },
  { icon: RefreshCw, title: 'Refresh token', text: 'Rotation à chaque renouvellement' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <>
      <section className="container hero">
        <p className="eyebrow">Sécurité des systèmes distribués</p>
        <h1 className="display" style={{ marginTop: 18 }}>Bienvenue</h1>
        <p className="lead">
          Déclarez, suivez et résolvez les incidents informatiques et de cybersécurité de l’entreprise —
          chaque accès est contrôlé par un JWT et par votre rôle.
        </p>
        <div className="cta">
          {user ? (
            <Link href="/dashboard" className="btn btn-primary btn-lg">Mon tableau de bord</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary btn-lg">Commencer</Link>
              <Link href="/register" className="btn btn-outline btn-lg">Créer un compte</Link>
            </>
          )}
        </div>
        <span className="scroll-hint">Défiler</span>
      </section>

      <section id="fonctionnalites" className="container features">
        <p className="eyebrow">Trois rôles, trois espaces</p>
        <h2 className="h1" style={{ marginBottom: 26 }}>Chacun voit ce qu’il doit voir</h2>
        <div className="grid-3">
          {ROLES.map((r) => (
            <article key={r.n} className="card role-card">
              <span className="num">{r.n}</span>
              <h3 className="h2">{r.title}</h3>
              <ul>{r.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="sec-strip">
          {SECURITY.map(({ icon: Icon, title, text }) => (
            <div key={title} className="sec-item">
              <Icon size={20} />
              <div><b>{title}</b><span>{text}</span></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="container row-wrap">
          <span>Incident Desk</span>
          <span className="spacer" />
          <span>Spring Boot · Spring Security · JWT · Next.js</span>
        </div>
      </footer>
    </>
  );
}
