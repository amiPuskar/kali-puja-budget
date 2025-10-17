'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, ACCESS_LEVELS } from '@/lib/roles';
import { 
  Home, 
  UserCheck, 
  Users,
  Receipt, 
  CheckSquare, 
  Package, 
  Gift, 
  Target, 
  DollarSign,
  Calendar,
  CalendarDays,
  Link as LinkIcon
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { isAdmin, isSuperAdmin, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, visible: true },
    { name: 'Puja Management', href: '/pujas', icon: CalendarDays, visible: hasPermission(user?.role, 'canManagePujas') },
    { name: 'Contributions', href: '/contributions', icon: UserCheck, visible: true },
    { name: 'Members', href: '/members', icon: Users, visible: hasPermission(user?.role, 'canManageMembers') },
    { name: 'Pending Members', href: '/pending-members', icon: UserCheck, visible: hasPermission(user?.role, 'canManagePendingMembers') },
    { name: 'Signup Link', href: '/signup-link', icon: LinkIcon, visible: hasPermission(user?.role, 'canViewSignupLink') },
    { name: 'Budget Items', href: '/budget-items', icon: Target, visible: hasPermission(user?.role, 'canManageBudgetItems') },
    // Make these visible to all roles (users will have view-only in-page)
    { name: 'Budget Allocations', href: '/budget', icon: DollarSign, visible: true },
    { name: 'Expenses', href: '/expenses', icon: Receipt, visible: true },
    { name: 'Events', href: '/events', icon: Calendar, visible: true },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare, visible: true },
    { name: 'Inventory', href: '/inventory', icon: Package, visible: true },
    { name: 'Sponsors', href: '/sponsors', icon: Gift, visible: true },
  ].filter(item => item.visible);

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile overlay */}
      <div className={`lg:hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-40 ${isOpen ? 'block' : 'hidden'}`} 
           onClick={onClose} />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header with title */}
          <div className="px-4 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">PB</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900">New Kalimata Boys Club</h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={onClose}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} Puskar Koley
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
