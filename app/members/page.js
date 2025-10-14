'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, DollarSign, X } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import PageHeader from '@/components/PageHeader';

export default function Members() {
  const { members, setMembers, currentClubId, getFilteredMembers } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    contribution: '',
    contact: '',
    email: ''
  });

  useEffect(() => {
    const unsubscribe = subscribeToCollection(COLLECTIONS.MEMBERS, setMembers);
    return () => unsubscribe();
  }, [setMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const memberData = {
        ...formData,
        contribution: parseFloat(formData.contribution) || 0,
        clubId: currentClubId || null
      };
      
      if (editingMember) {
        await updateDocument(COLLECTIONS.MEMBERS, editingMember.id, memberData);
        // close and clear after success
        setEditingMember(null);
        setIsModalOpen(false);
        setFormData({ name: '', role: '', contribution: '', contact: '', email: '' });
        toast.success('Member updated');
      } else {
        await addDocument(COLLECTIONS.MEMBERS, memberData);
        // close and clear after success
        setEditingMember(null);
        setIsModalOpen(false);
        setFormData({ name: '', role: '', contribution: '', contact: '', email: '' });
        toast.success('Member added');
      }
      // ensure any stale state is cleared
      // resetForm();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Failed to save member');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      role: member.role || '',
      contribution: member.contribution?.toString() || '',
      contact: member.contact || '',
      email: member.email || ''
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
      contribution: '',
      contact: '',
      email: ''
    });
    setEditingMember(null);
    setIsModalOpen(false);
  };

  const filteredMembers = getFilteredMembers();
  const totalContribution = filteredMembers.reduce((sum, member) => sum + (member.contribution || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Members"
        description="Manage committee members and their contributions"
        buttonText="Add Member"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
      />

      {/* Summary Card */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contributions</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{totalContribution.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Total Members</p>
            <p className="text-2xl font-semibold text-gray-900">{members.length}</p>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <div key={member.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
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
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Contribution:</span>
                <span className="text-lg font-semibold text-green-600">
                  ₹{member.contribution?.toLocaleString() || 0}
                </span>
              </div>
              
              {(member.contact || member.email) && (
                <div className="mt-2 space-y-1">
                  {member.contact && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Contact:</span> {member.contact}
                    </p>
                  )}
                  {member.email && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Email:</span> {member.email}
                    </p>
                  )}
                </div>
              )}
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 m-0">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <button
                type="button"
                onClick={resetForm}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter full name"
                  />
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
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Member">Member</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contribution Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.contribution}
                    onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                    className="input-field"
                    placeholder="Enter contribution amount"
                  />
                </div>
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="input-field"
                    placeholder="Enter contact number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="Enter email address"
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
        </div>
      )}
    </div>
  );
}
