import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import AdminUsers from '@/views/AdminUsers';

export const metadata = { title: 'Utilisateurs · Incident Desk' };

export default function Page() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={['ADMIN']}>
        <AdminUsers />
      </RoleRoute>
    </ProtectedRoute>
  );
}
