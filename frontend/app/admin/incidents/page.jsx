import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import AdminIncidents from '@/views/AdminIncidents';

export const metadata = { title: 'Tous les incidents · Incident Desk' };

export default function Page() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={['ADMIN']}>
        <AdminIncidents />
      </RoleRoute>
    </ProtectedRoute>
  );
}
