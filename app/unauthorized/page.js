'use client';

import { ShieldX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-4">
          <Link href="/" className="btn-primary inline-flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Need help? Contact your administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
