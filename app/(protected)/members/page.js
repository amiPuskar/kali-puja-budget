'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Users, X } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import SummaryCard from '@/components/SummaryCard';
import { getAccessLevel, ROLE_OPTIONS } from '@/lib/roles';
import { debugRoleMapping, validateUserRole } from '@/lib/roleDebug';

export default function Members() {
  const { members, setMembers } = useStore();
  const { isSuperAdmin, user, refreshUserSession, refreshUserFromDatabase } = useAuth();
  const canManage = isSuperAdmin ? isSuperAdmin() : false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    contact: '',
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Validation functions
  const validateField = (field, value) => {
    const errors = { ...fieldErrors };
    
    switch (field) {
      case 'contact':
        if (!value.trim()) {
          errors.contact = 'Contact number is required';
        } else if (!/^\d{10}$/.test(value.trim())) {
          errors.contact = 'Contact must be exactly 10 digits';
        } else {
          delete errors.contact;
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;
    }
    
    setFieldErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Restrict contact field to only digits
    if (name === 'contact') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-digits
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      validateField(name, numericValue);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToCollection(COLLECTIONS.MEMBERS, (data) => {
      setMembers(data || []);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [setMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare member data - only include password if it's provided
      const memberData = {
        name: formData.name,
        role: formData.role,
        contact: formData.contact,
        email: formData.email
      };

      // Only include password if it's provided and not empty
      if (formData.password && formData.password.trim() !== '') {
        memberData.password = formData.password;
      }

      if (editingMember) {
        await updateDocument(COLLECTIONS.MEMBERS, editingMember.id, memberData);
        
        // If updating current user's role, refresh their session
        if (user && editingMember.id === user.id && editingMember.role !== memberData.role) {
          console.log('🔄 Current user role updated, refreshing session...');
          console.log('Old role:', editingMember.role, 'New role:', memberData.role);
          
          // Debug role mapping
          debugRoleMapping(memberData.role);
          validateUserRole(user);
          
          // First refresh from database to get the latest data
          const refreshedUser = await refreshUserFromDatabase();
          if (refreshedUser) {
            console.log('✅ User refreshed from database successfully');
            validateUserRole(refreshedUser);
            toast.success(`Role updated to ${memberData.role}. Your session has been refreshed.`);
          } else {
            console.log('⚠️ Database refresh failed, using fallback');
            // Fallback to manual refresh
            const newAccessRole = getAccessLevel(memberData.role);
            console.log('New access role:', newAccessRole);
            
            const updatedUserData = {
              ...user,
              role: newAccessRole,
              originalRole: memberData.role
            };
            console.log('Updated user data:', updatedUserData);
            refreshUserSession(updatedUserData);
            toast.success(`Role updated to ${memberData.role}. Your session has been refreshed.`);
          }
          
          // Reload the page to apply new permissions
          setTimeout(() => {
            console.log('🔄 Reloading page to apply new permissions...');
            window.location.reload();
          }, 1500);
        } else {
          if (formData.password && formData.password.trim() !== '') {
            toast.success('Member updated with new password');
          } else {
            toast.success('Member updated successfully');
          }
        }
        
        setEditingMember(null);
        setIsModalOpen(false);
        setFormData({ name: '', role: '', contact: '', email: '', password: '' });
      } else {
        await addDocument(COLLECTIONS.MEMBERS, memberData);
        setEditingMember(null);
        setIsModalOpen(false);
        setFormData({ name: '', role: '', contact: '', email: '', password: '' });
        toast.success('Member added');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast.error(`Failed to save member: ${error.message}`);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      role: member.role || '',
      contact: member.contact || '',
      email: member.email || '',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteDocument(COLLECTIONS.MEMBERS, id);
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      contact: '',
      email: '',
      password: ''
    });
    setEditingMember(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading members..." />;
  }

  if (!isSuperAdmin()) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">Only Super Admin can manage club members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Club Members"
        description="Manage club members (contributions are managed separately per puja)"
        buttonText="Add Member"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
      />

      {/* Summary Card */}
      <SummaryCard
        items={[
          {
            icon: Users,
            label: 'Total Club Members',
            value: members.length.toString(),
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            icon: Users,
            label: 'Active Members',
            value: members.length.toString(),
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          }
        ]}
      />

      {/* Desktop Table */}
      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                {canManage && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-block text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.contact || '-'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email || '-'}</div>
                  </td>
                  {canManage && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit member"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile List - Individual Cards */}
      <div className="sm:hidden space-y-3">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                  <p className="text-xs text-gray-500">{member.contact || 'No contact'}</p>
                </div>
              </div>
              
              <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                {member.role}
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="mb-3">
              <p className="text-xs text-gray-500">{member.email || 'No email'}</p>
            </div>
            
            {/* Actions */}
            {canManage && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 py-2 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No members</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new member.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input-field ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter full name"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select role</option>
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className={`input-field ${fieldErrors.contact ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter 10-digit contact number"
                    maxLength="10"
                  />
                  {fieldErrors.contact && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.contact}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter email address"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                  )}
                </div>
                  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingMember ? '(Optional - leave blank to keep current password)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder={editingMember ? "Enter new password (or leave blank)" : "Set initial password"}
                    required={!editingMember}
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingMember ? 'Update' : 'Add'} Member
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
}
