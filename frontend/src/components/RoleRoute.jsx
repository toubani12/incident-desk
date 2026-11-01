'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE } from '@/utils/labels';

/** N'affiche la page que si le rôle de l'utilisateur fait partie de `roles`. */
export default function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return null;

  if (!roles.includes(user.role)) {
    return (
      <div className="container forbidden">
        <div className="code">403</div>
        <p className="eyebrow" style={{ marginTop: 18 }}>Accès refusé</p>
        <h1 className="h1" style={{ fontSize: 30 }}>Cette page n’est pas pour vous</h1>
        <p className="lead" style={{ margin: '12px auto 28px' }}>
          Réservée au rôle {roles.map((r) => ROLE[r]).join(' / ')}. Vous êtes connecté en tant que {ROLE[user.role]}.
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          <ShieldAlert size={15} /> Retour au tableau de bord
        </Link>
      </div>
    );
  }
  return children;
}
