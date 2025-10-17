// Role debugging utilities
import { getAccessLevel, ROLE_MAPPING, DATABASE_ROLES, ACCESS_LEVELS } from './roles';

export const debugRoleMapping = (databaseRole) => {
  console.log('🔍 Role Debug Information:');
  console.log('Database Role:', databaseRole);
  console.log('Mapped Access Level:', getAccessLevel(databaseRole));
  console.log('All Role Mappings:', ROLE_MAPPING);
  console.log('Available Database Roles:', Object.values(DATABASE_ROLES));
  console.log('Available Access Levels:', Object.values(ACCESS_LEVELS));
  
  return {
    databaseRole,
    accessLevel: getAccessLevel(databaseRole),
    isValid: Object.values(DATABASE_ROLES).includes(databaseRole)
  };
};

export const validateUserRole = (user) => {
  if (!user) {
    console.log('❌ No user provided');
    return false;
  }
  
  console.log('👤 User Role Validation:');
  console.log('User ID:', user.id);
  console.log('User Name:', user.name);
  console.log('Original Role:', user.originalRole);
  console.log('Current Role:', user.role);
  
  const expectedAccessLevel = getAccessLevel(user.originalRole);
  const isCorrect = user.role === expectedAccessLevel;
  
  console.log('Expected Access Level:', expectedAccessLevel);
  console.log('Role Mapping Correct:', isCorrect);
  
  if (!isCorrect) {
    console.log('⚠️ Role mismatch detected!');
    console.log('Should be:', expectedAccessLevel);
    console.log('Currently is:', user.role);
  }
  
  return isCorrect;
};

export const testAllRoleMappings = () => {
  console.log('🧪 Testing All Role Mappings:');
  Object.values(DATABASE_ROLES).forEach(role => {
    const accessLevel = getAccessLevel(role);
    console.log(`${role} → ${accessLevel}`);
  });
};
