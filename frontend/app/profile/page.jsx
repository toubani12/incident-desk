import ProtectedRoute from '@/components/ProtectedRoute';
import Profile from '@/views/Profile';

export const metadata = { title: 'Mon profil · Incident Desk' };

export default function Page() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
