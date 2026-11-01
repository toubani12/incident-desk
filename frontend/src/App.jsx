'use client';

import EmberBackground from '@/components/EmberBackground';
import Navbar from '@/components/Navbar';

/** Coquille de l'application : fond, barre de navigation, contenu de la route courante. */
export default function App({ children }) {
  return (
    <>
      <EmberBackground />
      <Navbar />
      <main className="page">{children}</main>
    </>
  );
}
