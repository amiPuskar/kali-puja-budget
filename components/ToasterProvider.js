'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return <Toaster position="top-center" toastOptions={{ duration: 2500 }} />;
}


