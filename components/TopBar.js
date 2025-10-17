'use client';

import { useState } from 'react';
import { Bell, User, LogOut, Menu, X, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePuja } from '@/contexts/PujaContext';

const TopBar = ({ onMenuClick, isMenuOpen }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPujaSelector, setShowPujaSelector] = useState(false);
  
  const { user, logout } = useAuth();
  const { currentPuja, pujas, switchPuja } = usePuja();

  const handleLogout = () => {
    logout();
  };

  const notifications = [
    { id: 1, message: 'New member added', time: '2 min ago', type: 'info' },
    { id: 2, message: 'Budget item updated', time: '1 hour ago', type: 'success' },
    { id: 3, message: 'Task deadline approaching', time: '3 hours ago', type: 'warning' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">PB</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Puja Budget</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Management System</p>
            </div>
          </div>

          {/* Puja Selector */}
          {currentPuja && (
            <div className="hidden md:block relative">
              <button
                onClick={() => setShowPujaSelector(!showPujaSelector)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-600" />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {currentPuja.name}
                  </div>
                  {currentPuja.managerId && (
                    <div className="text-xs text-gray-500 truncate">
                      Manager: {currentPuja.managerName || 'Assigned'}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* Puja Dropdown */}
              {showPujaSelector && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Select Puja</h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {pujas.map((puja) => (
                      <button
                        key={puja.id}
                        onClick={() => {
                          switchPuja(puja);
                          setShowPujaSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                          currentPuja.id === puja.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{puja.name}</p>
                            <p className="text-xs text-gray-500">{puja.year}</p>
                            {puja.managerId && (
                              <p className="text-xs text-blue-600">Manager: {puja.managerName || 'Assigned'}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            puja.status === 'active' ? 'bg-green-100 text-green-600' :
                            puja.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {puja.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - Notifications, Profile, Logout */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Account Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Help & Support
                  </button>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfileMenu || showNotifications || showPujaSelector) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
            setShowPujaSelector(false);
          }}
        />
      )}
    </div>
  );
};

export default TopBar;
