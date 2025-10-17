import LayoutWrapper from '@/components/LayoutWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProtectedLayout({ children }) {
  return (
    <LayoutWrapper>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </LayoutWrapper>
  );
}
