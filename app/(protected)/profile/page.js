'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { COLLECTIONS, updateDocument, subscribeToCollection } from '@/lib/firebase';
import useStore from '@/store/useStore';
import { toast } from '@/lib/toast';
import PageHeader from '@/components/PageHeader';
import { ShieldAlert, Save, KeyRound, User, Mail, Phone } from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const { members, setMembers } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', contact: '', role: '' });
  const [passwordForm, setPasswordForm] = useState({ next: '', confirm: '' });
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
    }
    
    setFieldErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Restrict contact field to only digits
    if (name === 'contact') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-digits
      setProfile(prev => ({ ...prev, [name]: numericValue }));
      validateField(name, numericValue);
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.MEMBERS, setMembers);
    return () => unsub();
  }, [setMembers]);

  const memberRecord = useMemo(() => {
    if (!user) return null;
    if (user.id === 'mock-super-admin') return null;
    return members.find(m => m.id === user.id) || null;
  }, [members, user]);

  useEffect(() => {
    if (!user) return;
    if (memberRecord) {
      setProfile({
        name: memberRecord.name || '',
        email: memberRecord.email || '',
        contact: memberRecord.contact || '',
        role: memberRecord.role || ''
      });
    } else {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        contact: user.contact || '',
        role: user.originalRole || user.role || ''
      });
    }
  }, [memberRecord, user]);

  const canEdit = user && user.id !== 'mock-super-admin';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      toast.info('Profile is not editable for mock super admin');
      return;
    }
    if (!memberRecord) return;
    setIsSaving(true);
    try {
      await updateDocument(COLLECTIONS.MEMBERS, memberRecord.id, {
        name: profile.name,
        email: profile.email,
        contact: profile.contact
      });
      const updatedUser = {
        ...user,
        name: profile.name,
        email: profile.email,
        contact: profile.contact
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      login(updatedUser);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      toast.info('Password cannot be changed for mock super admin');
      return;
    }
    if (!memberRecord) return;
    if (!passwordForm.next || !passwordForm.confirm) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await updateDocument(COLLECTIONS.MEMBERS, memberRecord.id, { password: passwordForm.next });
      setPasswordForm({ next: '', confirm: '' });
      toast.success('Password updated');
    } catch (err) {
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="View and update your profile details and password"
        showButton={false}
      />

      {!canEdit && (
        <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 mt-0.5" />
          <div>
            <p className="text-sm font-medium">You are logged in as mock Super Admin.</p>
            <p className="text-sm">Profile edits are disabled for this account.</p>
          </div>
        </div>
      )}

      {/* Profile details */}
      <form onSubmit={handleSaveProfile} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input-field pl-10"
                placeholder="Enter full name"
                disabled
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldAlert className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={profile.role}
                className="input-field pl-10 bg-gray-50"
                placeholder="Your role"
                disabled
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                className={`input-field pl-10 ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter email address"
                disabled={!canEdit}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="contact"
                value={profile.contact}
                onChange={handleInputChange}
                className={`input-field pl-10 ${fieldErrors.contact ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter 10-digit contact number"
                maxLength="10"
                disabled={!canEdit}
              />
            </div>
            {fieldErrors.contact && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.contact}</p>
            )}
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={!canEdit || isSaving} className="btn-primary inline-flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>

      {/* Change password */}
      <form onSubmit={handleChangePassword} className="card space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
          <KeyRound className="w-4 h-4" />
          <span>Change Password</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwordForm.next}
              onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
              className="input-field"
              placeholder="New password"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="input-field"
              placeholder="Confirm password"
              disabled={!canEdit}
            />
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={!canEdit} className="btn-secondary inline-flex items-center space-x-2">
            <KeyRound className="w-4 h-4" />
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  );
}


