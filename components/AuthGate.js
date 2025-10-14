'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ToastHost from '@/components/ToastHost';

export default function AuthGate({ children }) {
  const { user, hydrated, hydrateAuthFromStorage, setCurrentClubId } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) {
      hydrateAuthFromStorage();
      return;
    }
    if (pathname === '/login') return;
    if (!user) {
      router.replace('/login');
      return;
    }
    // Ensure club admin context is set for filtering
    if (user?.role === 'club_admin' && user?.clubId) {
      setCurrentClubId(user.clubId);
    }
    // Role-based route restrictions
    if (user?.role === 'platform_admin') {
      // Allow only /clubs and nested
      if (!pathname.startsWith('/clubs')) {
        router.replace('/clubs');
      }
      return;
    }
    if (user?.role === 'club_admin' || user?.role === 'member') {
      // Allow: '/', '/members', '/pujas', and '/clubs/[id]' for manage
      const allowed = ['/', '/members', '/pujas'];
      const isAllowedBase = allowed.includes(pathname);
      const isClubManage = pathname.startsWith('/clubs/');
      if (!isAllowedBase && !isClubManage) {
        router.replace('/');
      }
    }
  }, [user, router, pathname]);

  // Public login route: show only the login page content
  if (!hydrated) {
    return null;
  }

  if (pathname === '/login') {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </main>
        <ToastHost />
      </div>
    );
  }

  // For all other routes, require auth and render the app shell
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </main>
      </div>
      <Footer />
      <ToastHost />
    </div>
  );
}


