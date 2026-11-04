import ProtectedRoute from '@/components/ProtectedRoute';
import IncidentDetails from '@/views/IncidentDetails';

export const metadata = { title: 'Incident · Incident Desk' };

/** Tous les rôles authentifiés : le backend vérifie propriétaire / technicien affecté / admin. */
export default function Page() {
  return (
    <ProtectedRoute>
      <IncidentDetails />
    </ProtectedRoute>
  );
}
