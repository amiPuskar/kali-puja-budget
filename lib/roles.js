/**
 * Centralized Role Management System
 * This file contains all role definitions and mappings used throughout the application
 */

// Database roles (as stored in Firestore)
export const DATABASE_ROLES = {
  PRESIDENT: 'President',
  VICE_PRESIDENT: 'Vice President',
  MANAGER: 'Manager',
  VICE_MANAGER: 'Vice Manager',
  MEMBER: 'Member'
};

// Access levels (internal system roles)
export const ACCESS_LEVELS = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user'
};

// Role to access level mapping
export const ROLE_MAPPING = {
  [DATABASE_ROLES.PRESIDENT]: ACCESS_LEVELS.SUPER_ADMIN,
  [DATABASE_ROLES.VICE_PRESIDENT]: ACCESS_LEVELS.SUPER_ADMIN,
  [DATABASE_ROLES.MANAGER]: ACCESS_LEVELS.ADMIN,
  [DATABASE_ROLES.VICE_MANAGER]: ACCESS_LEVELS.ADMIN,
  [DATABASE_ROLES.MEMBER]: ACCESS_LEVELS.USER
};

// Access level permissions
export const PERMISSIONS = {
  [ACCESS_LEVELS.SUPER_ADMIN]: {
    canManageMembers: true,
    canManagePujas: true,
    canManagePendingMembers: true,
    canManageBudgetItems: true,
    canManageBudgetAllocations: true,
    canManageExpenses: true,
    canManageContributions: true,
    canViewSignupLink: true,
    canApproveMembers: true,
    canCompletePujas: true
  },
  [ACCESS_LEVELS.ADMIN]: {
    canManageMembers: false,
    canManagePujas: false,
    canManagePendingMembers: false,
    canManageBudgetItems: true,
    canManageBudgetAllocations: true,
    canManageExpenses: true,
    canManageContributions: true,
    canViewSignupLink: false,
    canApproveMembers: false,
    canCompletePujas: false
  },
  [ACCESS_LEVELS.USER]: {
    canManageMembers: false,
    canManagePujas: false,
    canManagePendingMembers: false,
    canManageBudgetItems: false,
    canManageBudgetAllocations: false,
    canManageExpenses: false,
    canManageContributions: false,
    canViewSignupLink: false,
    canApproveMembers: false,
    canCompletePujas: false
  }
};

// Role options for dropdowns
export const ROLE_OPTIONS = [
  { value: DATABASE_ROLES.MEMBER, label: DATABASE_ROLES.MEMBER },
  { value: DATABASE_ROLES.MANAGER, label: DATABASE_ROLES.MANAGER },
  { value: DATABASE_ROLES.VICE_MANAGER, label: DATABASE_ROLES.VICE_MANAGER },
  { value: DATABASE_ROLES.VICE_PRESIDENT, label: DATABASE_ROLES.VICE_PRESIDENT },
  { value: DATABASE_ROLES.PRESIDENT, label: DATABASE_ROLES.PRESIDENT }
];

// Utility functions
export const getAccessLevel = (databaseRole) => {
  if (!databaseRole) return ACCESS_LEVELS.USER;
  return ROLE_MAPPING[databaseRole] || ACCESS_LEVELS.USER;
};

export const hasPermission = (accessLevel, permission) => {
  return PERMISSIONS[accessLevel]?.[permission] || false;
};

export const isSuperAdmin = (accessLevel) => {
  return accessLevel === ACCESS_LEVELS.SUPER_ADMIN;
};

export const isAdmin = (accessLevel) => {
  return accessLevel === ACCESS_LEVELS.SUPER_ADMIN || accessLevel === ACCESS_LEVELS.ADMIN;
};

export const isUser = (accessLevel) => {
  return accessLevel === ACCESS_LEVELS.USER;
};

// Role display helpers
export const getRoleDisplayName = (databaseRole) => {
  return databaseRole || 'Member';
};

export const getAccessLevelDisplayName = (accessLevel) => {
  const displayNames = {
    [ACCESS_LEVELS.SUPER_ADMIN]: 'Super Admin',
    [ACCESS_LEVELS.ADMIN]: 'Admin',
    [ACCESS_LEVELS.USER]: 'User'
  };
  return displayNames[accessLevel] || 'User';
};

// Validation functions
export const isValidDatabaseRole = (role) => {
  return Object.values(DATABASE_ROLES).includes(role);
};

export const isValidAccessLevel = (accessLevel) => {
  return Object.values(ACCESS_LEVELS).includes(accessLevel);
};
