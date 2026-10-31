'use client';

import { usePathname } from 'next/navigation';

/** Fond noir avec vagues rouge braise floutées (inspiré de la maquette). */
export default function EmberBackground() {
  const pathname = usePathname();
  const vivid = pathname === '/' || pathname === '/login' || pathname === '/register';
  return (
    <div className={`ember ${vivid ? '' : 'dim'}`} aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </div>
  );
}
