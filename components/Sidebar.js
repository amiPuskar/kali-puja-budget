'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useStore from '@/store/useStore';
import { Home, UserCheck, Receipt, CheckSquare, Package, Gift, Target, Calendar, Users } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Budget', href: '/budget', icon: Target },
  { name: 'Members', href: '/members', icon: UserCheck },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Sponsors', href: '/sponsors', icon: Gift },
  { name: 'Clubs', href: '/clubs', icon: Users },
  { name: 'Pujas', href: '/pujas', icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar, isPlatformAdmin, user, clubs, currentClubId } = useStore();
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const isManagingClub = pathname.startsWith('/clubs/') && pathname !== '/clubs';
  const clubMenu = ['Dashboard', 'Members', 'Pujas'];
  const platformMenu = ['Clubs'];
  const items = isPlatformAdmin() && !isManagingClub
    ? navItems.filter(n => platformMenu.includes(n.name))
    : navItems.filter(n => clubMenu.includes(n.name));

  const activeClubName = (() => {
    if (user?.role === 'club_admin' && currentClubId) {
      return clubs.find(c => c.id === currentClubId)?.name || 'My Club';
    }
    if (isManagingClub && currentClubId) {
      return clubs.find(c => c.id === currentClubId)?.name || 'Club';
    }
    return null;
  })();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 border-r bg-white">
        <div className="h-16 flex items-center px-4 border-b">
          {activeClubName ? (
            <span className="text-lg font-bold text-gray-900 truncate" title={activeClubName}>{activeClubName}</span>
          ) : (
            <span className="text-lg font-bold text-gray-900">Clubs</span>
          )}
        </div>
        <nav className="p-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeSidebar} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-lg">
            <div className="h-16 flex items-center px-4 border-b justify-between">
              <span className="text-lg font-bold text-gray-900 truncate" title={activeClubName || 'Clubs'}>{activeClubName || 'Clubs'}</span>
              <button className="p-2 rounded-md hover:bg-gray-100" onClick={closeSidebar} aria-label="Close menu">✕</button>
            </div>
            <nav className="p-3 space-y-1">
            {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}


