'use client';

import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { PujaProvider } from '@/contexts/PujaContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ToastHost from '@/components/ToastHost';

const LayoutWrapper = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <AuthProvider>
      <PujaProvider>
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="lg:ml-64 min-h-screen">
          <TopBar onMenuClick={toggleSidebar} isMenuOpen={isSidebarOpen} />
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <ToastHost />
      </PujaProvider>
    </AuthProvider>
  );
};

export default LayoutWrapper;
