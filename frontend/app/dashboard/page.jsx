import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/views/Dashboard';

export const metadata = { title: 'Tableau de bord · Incident Desk' };

export default function Page() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
