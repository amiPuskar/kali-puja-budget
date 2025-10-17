'use client';

import { usePuja } from '@/contexts/PujaContext';
import LoadingSpinner from './LoadingSpinner';

const PujaLoader = ({ children }) => {
  const { loading } = usePuja();

  if (loading) {
    return <LoadingSpinner message="Loading puja data..." />;
  }

  return children;
};

export default PujaLoader;
