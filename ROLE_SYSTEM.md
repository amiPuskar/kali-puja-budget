# Centralized Role Management System

## Overview
This document describes the centralized role management system implemented throughout the application. All role-related logic is now centralized in `lib/roles.js` for consistency and maintainability.

## Files Updated
- ✅ `lib/roles.js` - Central role definitions and utilities
- ✅ `app/login/page.js` - Uses centralized role mapping
- ✅ `contexts/AuthContext.js` - Uses centralized role checking
- ✅ `app/(protected)/members/page.js` - Uses centralized role options and mapping
- ✅ `app/(protected)/pending-members/page.js` - Uses centralized role options
- ✅ `components/Sidebar.js` - Uses centralized permission checking
- ✅ `app/(protected)/budget-items/page.js` - Uses centralized permission checking
- ✅ `components/TopBar.js` - Uses centralized role display

## Role Structure

### Database Roles (Stored in Firestore)
```javascript
DATABASE_ROLES = {
  PRESIDENT: 'President',
  VICE_PRESIDENT: 'Vice President', 
  MANAGER: 'Manager',
  VICE_MANAGER: 'Vice Manager',
  MEMBER: 'Member'
}
```

### Access Levels (Internal System)
```javascript
ACCESS_LEVELS = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  USER: 'user'
}
```

### Role Mapping
```javascript
ROLE_MAPPING = {
  'President': 'super_admin',
  'Vice President': 'super_admin',
  'Manager': 'admin',
  'Vice Manager': 'admin',
  'Member': 'user'
}
```

## Permissions Matrix

| Permission | Super Admin | Admin | User |
|------------|-------------|-------|------|
| canManageMembers | ✅ | ❌ | ❌ |
| canManagePujas | ✅ | ❌ | ❌ |
| canManagePendingMembers | ✅ | ❌ | ❌ |
| canManageBudgetItems | ✅ | ✅ | ❌ |
| canManageBudgetAllocations | ✅ | ✅ | ❌ |
| canManageExpenses | ✅ | ✅ | ❌ |
| canManageContributions | ✅ | ✅ | ❌ |
| canViewSignupLink | ✅ | ❌ | ❌ |
| canApproveMembers | ✅ | ❌ | ❌ |
| canCompletePujas | ✅ | ❌ | ❌ |

## Utility Functions

### Role Mapping
```javascript
getAccessLevel(databaseRole) // Maps database role to access level
```

### Permission Checking
```javascript
hasPermission(accessLevel, permission) // Checks if access level has permission
```

### Role Validation
```javascript
isSuperAdmin(accessLevel) // Returns true if super admin
isAdmin(accessLevel) // Returns true if admin or super admin
isUser(accessLevel) // Returns true if user
```

### Display Helpers
```javascript
getRoleDisplayName(databaseRole) // Gets display name for database role
getAccessLevelDisplayName(accessLevel) // Gets display name for access level
```

### Validation
```javascript
isValidDatabaseRole(role) // Validates database role
isValidAccessLevel(accessLevel) // Validates access level
```

## Usage Examples

### In Components
```javascript
import { hasPermission, getAccessLevel, ROLE_OPTIONS } from '@/lib/roles';

// Check permissions
const canManage = hasPermission(user?.role, 'canManageMembers');

// Get role options for dropdowns
<select>
  {ROLE_OPTIONS.map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>

// Map database role to access level
const accessLevel = getAccessLevel(member.role);
```

### In AuthContext
```javascript
import { isAdmin, isSuperAdmin } from '@/lib/roles';

const isAdmin = () => checkIsAdmin(user?.role);
const isSuperAdmin = () => checkIsSuperAdmin(user?.role);
```

## Benefits

1. **Centralized Management**: All role logic in one place
2. **Consistency**: Same role definitions across entire app
3. **Maintainability**: Easy to add/modify roles and permissions
4. **Type Safety**: Clear role definitions and mappings
5. **Reusability**: Utility functions can be used anywhere
6. **Scalability**: Easy to add new roles and permissions

## Testing

The role system has been tested and verified:
- ✅ Role mapping works correctly
- ✅ Permission checking works correctly  
- ✅ Role validation works correctly
- ✅ All components use centralized system
- ✅ No linting errors

## Future Enhancements

1. **Role Hierarchies**: Support for role inheritance
2. **Dynamic Permissions**: Database-driven permissions
3. **Role Groups**: Group-based role assignments
4. **Audit Logging**: Track role changes
5. **Role Templates**: Predefined role sets for different organizations
