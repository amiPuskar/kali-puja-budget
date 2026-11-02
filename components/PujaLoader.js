'use client';

import { usePuja } from '@/contexts/PujaContext';
import LoadingSpinner from './LoadingSpinner';

const PujaLoader = ({ children }) => {
  const { loading, loadError, retryLoading } = usePuja();

  if (loading) {
    return <LoadingSpinner message="Loading puja data..." />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-lg text-center">
          <h1 className="text-lg font-semibold text-gray-900">Unable to load Puja data</h1>
          <p className="mt-2 text-sm text-gray-600">{loadError}</p>
          <p className="mt-2 text-sm text-gray-600">
            Check your Firebase configuration and Firestore rules, then try again.
          </p>
          <button type="button" onClick={retryLoading} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default PujaLoader;
