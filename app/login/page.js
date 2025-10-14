'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import PageHeader from '@/components/PageHeader';
import { toast } from '@/lib/toast';
import { findClubByCredentials } from '@/lib/firebase';

// Static platform admin credentials (change as needed)
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin ';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setUser({ id: 'platform-admin', name: 'Platform Admin', role: 'platform_admin' });
        toast.success('Logged in as platform admin');
        router.replace('/clubs');
        return;
      }

      // Try club admin login
      const club = await findClubByCredentials(email, password);
      if (club) {
        setUser({ id: `club-admin-${club.id}`, name: club.name, role: 'club_admin', clubId: club.id });
        toast.success('Logged in as club admin');
        router.replace('/');
        return;
      }

      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Login" description="Platform admin access" showButton={false} />
      <div className="card max-w-md mx-auto">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@platform.local"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}


