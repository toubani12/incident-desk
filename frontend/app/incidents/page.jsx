import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import MyIncidents from '@/views/MyIncidents';

export const metadata = { title: 'Mes incidents · Incident Desk' };

export default function Page() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={['EMPLOYEE']}>
        <MyIncidents />
      </RoleRoute>
    </ProtectedRoute>
  );
}
