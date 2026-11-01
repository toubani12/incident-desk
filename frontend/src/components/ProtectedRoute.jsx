'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loader from './Loader';

/**
 * Bloque l'accès aux pages privées si aucun JWT n'est présent et redirige vers /login.
 * Rappel : c'est une protection d'ergonomie ; chaque appel API est re-vérifié par Spring Security.
 */
export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, router, pathname]);

  if (!ready || !user) return <Loader label="Vérification de la session…" />;
  return children;
}
