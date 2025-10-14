'use client';

import Link from 'next/link';
import { Bell, User, LogOut } from 'lucide-react';
import useStore from '@/store/useStore';

const Header = () => {
  const { logout, toggleSidebar } = useStore();

  // Navigation moved to Sidebar

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left-aligned menu (hamburger) for mobile */}
          <div className="flex items-center">
            <button className="p-2 rounded-md hover:bg-gray-100 text-gray-600 md:hidden" aria-label="Open menu" onClick={toggleSidebar}>
              <span className="block w-5 h-0.5 bg-gray-700 mb-1"></span>
              <span className="block w-5 h-0.5 bg-gray-700 mb-1"></span>
              <span className="block w-5 h-0.5 bg-gray-700"></span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md hover:bg-gray-100 text-gray-600" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100 text-gray-600" aria-label="Profile">
              <User className="w-5 h-5" />
            </button>
            <button onClick={logout} className="p-2 rounded-md hover:bg-gray-100 text-gray-700 flex items-center gap-1" aria-label="Logout">
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>

          {/* Sidebar handles navigation including mobile */}
        </div>

        {/* No mobile nav list; navigation is in Sidebar */}
      </div>
    </header>
  );
};

export default Header;
