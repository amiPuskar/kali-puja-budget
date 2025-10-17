'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  CalendarDays
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Puja Management', href: '/pujas', icon: CalendarDays },
    { name: 'Contributions', href: '/contributions', icon: UserCheck },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Budget Items', href: '/budget-items', icon: Target },
    { name: 'Budget Allocations', href: '/budget', icon: DollarSign },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Sponsors', href: '/sponsors', icon: Gift },
    { name: 'Access Denied', href: '/unauthorized', icon: UserCheck },
  ];

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
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
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
