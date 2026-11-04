import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import NewIncident from '@/views/NewIncident';

export const metadata = { title: 'Déclarer un incident · Incident Desk' };

export default function Page() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={['EMPLOYEE']}>
        <NewIncident />
      </RoleRoute>
    </ProtectedRoute>
  );
}
