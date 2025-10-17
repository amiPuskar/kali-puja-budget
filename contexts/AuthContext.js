'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin as checkIsAdmin, isSuperAdmin as checkIsSuperAdmin } from '@/lib/roles';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Loaded user from localStorage:', parsedUser);
          
          // Validate user data integrity
          if (parsedUser.originalRole && parsedUser.role) {
            const { getAccessLevel } = require('@/lib/roles');
            const expectedAccessLevel = getAccessLevel(parsedUser.originalRole);
            
            if (parsedUser.role !== expectedAccessLevel) {
              console.warn('User role mismatch detected. Expected:', expectedAccessLevel, 'Found:', parsedUser.role);
              console.log('Fixing user role automatically...');
              
              // Fix the role automatically
              const correctedUser = {
                ...parsedUser,
                role: expectedAccessLevel
              };
              
              localStorage.setItem('user', JSON.stringify(correctedUser));
              setUser(correctedUser);
            } else {
              setUser(parsedUser);
            }
          } else {
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const refreshUserSession = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const forceRefreshUserRole = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.originalRole) {
        const { getAccessLevel } = require('@/lib/roles');
        const correctedRole = getAccessLevel(parsedUser.originalRole);
        
        const correctedUser = {
          ...parsedUser,
          role: correctedRole
        };
        
        console.log('Force refreshing user role:', {
          originalRole: parsedUser.originalRole,
          oldAccessRole: parsedUser.role,
          newAccessRole: correctedRole
        });
        
        localStorage.setItem('user', JSON.stringify(correctedUser));
        setUser(correctedUser);
        return true;
      }
    }
    return false;
  };

  const hasRole = (requiredRoles) => {
    if (!user) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  const isAdmin = () => {
    const result = checkIsAdmin(user?.role);
    console.log('isAdmin check:', { userRole: user?.role, result });
    return result;
  };

  const isSuperAdmin = () => {
    const result = checkIsSuperAdmin(user?.role);
    console.log('isSuperAdmin check:', { userRole: user?.role, result });
    return result;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUserSession,
    forceRefreshUserRole,
    hasRole,
    isAdmin,
    isSuperAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
