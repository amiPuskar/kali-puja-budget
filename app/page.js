'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';

export default function RootLanding() {
  const router = useRouter();
  const { isPlatformAdmin, hydrated, hydrateAuthFromStorage } = useStore();

  useEffect(() => {
    if (!hydrated) {
      hydrateAuthFromStorage();
      return;
    }
    if (isPlatformAdmin()) {
      router.replace('/clubs');
    } else {
      router.replace('/dashboard');
    }
  }, [hydrated, hydrateAuthFromStorage, isPlatformAdmin, router]);

  return null;
}


