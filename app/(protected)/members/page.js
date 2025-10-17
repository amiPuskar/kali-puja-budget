'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Users, X } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import { getAccessLevel, ROLE_OPTIONS } from '@/lib/roles';

export default function Members() {
  const { members, setMembers } = useStore();
  const { isSuperAdmin, user, refreshUserSession } = useAuth();
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
    const unsubscribe = subscribeToCollection(COLLECTIONS.MEMBERS, setMembers);
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
          console.log('Current user role updated, refreshing session...');
          const newAccessRole = getAccessLevel(memberData.role);
          const updatedUserData = {
            ...user,
            role: newAccessRole,
            originalRole: memberData.role
          };
          
          refreshUserSession(updatedUserData);
          toast.success('Member updated. Your session has been refreshed.');
          
          // Reload the page to apply new permissions
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          if (formData.password && formData.password.trim() !== '') {
            toast.success('Member updated with new password');
          } else {
            toast.success('Member updated (password unchanged)');
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
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Club Members</p>
              <p className="text-2xl font-semibold text-gray-900">{members.length}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Active Members</p>
            <p className="text-2xl font-semibold text-gray-900">{members.length}</p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{member.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {member.contact && (
                              <span className="text-sm text-gray-500">{member.contact}</span>
                            )}
                            {member.contact && member.email && (
                              <span className="text-sm text-gray-400">|</span>
                            )}
                            {member.email && (
                              <span className="text-sm text-gray-500">{member.email}</span>
                            )}
                          </div>
                        </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
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
