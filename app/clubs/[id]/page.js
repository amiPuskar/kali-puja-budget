'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useStore from '@/store/useStore';

export default function ClubManagePage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params?.id;
  const { setCurrentClubId } = useStore();

  useEffect(() => {
    if (clubId) {
      setCurrentClubId(clubId);
      router.replace('/');
    }
  }, [clubId, setCurrentClubId, router]);

  return null;
}


