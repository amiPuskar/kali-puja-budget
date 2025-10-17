'use client';

import { useState } from 'react';
import { User, Menu, X, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePuja } from '@/contexts/PujaContext';

const TopBar = ({ onMenuClick, isMenuOpen }) => {
  const [showPujaSelector, setShowPujaSelector] = useState(false);
  
  const { user } = useAuth();
  const { currentPuja, pujas, switchPuja } = usePuja();


  const notifications = [
    { id: 1, message: 'New member added', time: '2 min ago', type: 'info' },
    { id: 2, message: 'Budget item updated', time: '1 hour ago', type: 'success' },
    { id: 3, message: 'Task deadline approaching', time: '3 hours ago', type: 'warning' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and Puja Selector */}
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

          {/* Puja Selector - responsive dropdown */}
          {currentPuja && (
            <div className="relative">
              <button
                onClick={() => setShowPujaSelector(!showPujaSelector)}
                className="flex items-center space-x-2 px-3 py-2 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors min-w-0"
              >
                <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <div className="text-sm font-medium text-primary-900 truncate">
                  {currentPuja.name}
                </div>
                <ChevronDown className="w-4 h-4 text-primary-600 flex-shrink-0" />
              </button>

              {/* Puja Dropdown - responsive */}
              {showPujaSelector && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Select Puja</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {pujas.map((puja) => (
                      <button
                        key={puja.id}
                        onClick={() => {
                          switchPuja(puja);
                          setShowPujaSelector(false);
                        }}
                        className={`w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          currentPuja.id === puja.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{puja.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{puja.year}</p>
                            {puja.managerId && (
                              <p className="text-xs text-blue-600 mt-1 truncate">
                                Manager: {puja.managerName || 'Assigned'}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ml-2 ${
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

        {/* Right side - Profile, Logout */}
        <div className="flex items-center space-x-1 sm:space-x-2">

          {/* Profile - Simple Display */}
          <div className="flex items-center space-x-2 p-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.originalRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {showPujaSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowPujaSelector(false);
          }}
        />
      )}
    </div>
  );
};

export default TopBar;
