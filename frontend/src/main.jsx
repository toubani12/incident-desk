'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';

/**
 * Équivalent du main.jsx d'un projet Vite : point d'entrée qui installe les providers
 * globaux (authentification, notifications). Avec Next.js, il est monté par app/layout.jsx.
 */
export default function Main({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
