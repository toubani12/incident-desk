import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import AssignedIncidents from '@/views/AssignedIncidents';

export const metadata = { title: 'Incidents affectés · Incident Desk' };

export default function Page() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={['TECHNICIAN']}>
        <AssignedIncidents />
      </RoleRoute>
    </ProtectedRoute>
  );
}
