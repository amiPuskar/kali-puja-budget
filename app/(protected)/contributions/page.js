'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck, DollarSign, X, User } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { usePuja } from '@/contexts/PujaContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';

export default function Contributions() {
  const { members, contributions, setMembers, setContributions } = useStore();
  const { currentPuja } = usePuja();
  const { isAdmin } = useAuth();
  const canManage = isAdmin ? isAdmin() : false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    // Subscribe to club members (not puja-specific)
    const unsubscribeMembers = subscribeToCollection(COLLECTIONS.MEMBERS, setMembers);
    
    if (currentPuja) {
      // Subscribe to contributions for current puja
      const unsubscribeContributions = subscribeToCollection(`${COLLECTIONS.CONTRIBUTIONS}_${currentPuja.id}`, setContributions);
      
      return () => {
        unsubscribeMembers();
        unsubscribeContributions();
      };
    }
    
    return () => {
      unsubscribeMembers();
    };
  }, [currentPuja, setMembers, setContributions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPuja) {
      toast.error('Please select a puja first');
      return;
    }

    try {
      const contributionData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        pujaId: currentPuja.id,
        pujaName: currentPuja.name
      };

      if (editingContribution) {
        await updateDocument(`${COLLECTIONS.CONTRIBUTIONS}_${currentPuja.id}`, editingContribution.id, contributionData);
        toast.success('Contribution updated');
      } else {
        await addDocument(`${COLLECTIONS.CONTRIBUTIONS}_${currentPuja.id}`, contributionData);
        toast.success('Contribution added');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving contribution:', error);
      toast.error('Failed to save contribution');
    }
  };

  const handleEdit = (contribution) => {
    setEditingContribution(contribution);
    setFormData({
      memberId: contribution.memberId || '',
      amount: contribution.amount?.toString() || '',
      notes: contribution.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!currentPuja) return;
    
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        await deleteDocument(`${COLLECTIONS.CONTRIBUTIONS}_${currentPuja.id}`, id);
        toast.success('Contribution deleted');
      } catch (error) {
        console.error('Error deleting contribution:', error);
        toast.error('Failed to delete contribution');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      memberId: '',
      amount: '',
      notes: ''
    });
    setEditingContribution(null);
    setIsModalOpen(false);
  };

  const totalContributions = contributions.reduce((sum, contribution) => sum + (contribution.amount || 0), 0);

  // Create a map of member contributions
  const memberContributions = {};
  contributions.forEach(contribution => {
    memberContributions[contribution.memberId] = contribution;
  });

  // Get all members with their contribution status
  const membersWithContributions = members.map(member => ({
    ...member,
    contribution: memberContributions[member.id] || null,
    hasContributed: !!memberContributions[member.id]
  }));

  // Members can view read-only; admins can manage

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contributions"
        description={`Manage member contributions for ${currentPuja?.name || 'selected puja'}`}
        buttonText="Add Contribution"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
        showButton={canManage}
      />

      {!canManage && (
        <div className="card">
          <p className="text-sm text-gray-600">You have view-only access. Please contact an admin to add or update contributions.</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contributions</p>
              <p className="text-xl font-semibold text-gray-900">
                ₹{totalContributions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Contributors</p>
              <p className="text-xl font-semibold text-gray-900">
                {membersWithContributions.filter(m => m.hasContributed).length}/{members.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-semibold text-gray-900">
                {membersWithContributions.filter(m => !m.hasContributed).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All Members with Contribution Status */}
      <div className="space-y-4">
        <div className="flex items-center flex-wrap sm:flex-nowrap justify-between">
          <h3 className="text-lg font-semibold text-gray-900">All Members - Contribution Status</h3>
          <div className="text-sm text-gray-500">
            {membersWithContributions.filter(m => m.hasContributed).length} of {members.length} contributed
          </div>
        </div>
        
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
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contribution
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {canManage && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {membersWithContributions.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 p-2 rounded-lg ${
                          member.hasContributed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <User className={`w-4 h-4 ${
                            member.hasContributed ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.contact || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {member.hasContributed ? (
                        <div className="text-sm font-semibold text-green-600">
                          ₹{member.contribution.amount?.toLocaleString() || 0}
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-400">Not Added</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {member.hasContributed ? (
                        <div className="text-sm text-gray-500">
                          {new Date(member.contribution.createdAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {member.hasContributed ? (
                            <>
                              <button
                                onClick={() => handleEdit(member.contribution)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit contribution"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(member.contribution.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete contribution"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setFormData({
                                  memberId: member.id,
                                  amount: '',
                                  notes: ''
                                });
                                setIsModalOpen(true);
                              }}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Add contribution"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
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
          {membersWithContributions.map((member) => (
            <div key={member.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    member.hasContributed ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <User className={`w-4 h-4 ${
                      member.hasContributed ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.contact || 'No contact'}</p>
                  </div>
                </div>
                
                {member.hasContributed ? (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      ₹{member.contribution.amount?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(member.contribution.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 font-medium">Pending</div>
                )}
              </div>
              
              {/* Actions */}
              {canManage && (
                <div className="flex space-x-2">
                  {member.hasContributed ? (
                    <>
                      <button
                        onClick={() => handleEdit(member.contribution)}
                        className="flex-1 py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.contribution.id)}
                        className="flex-1 py-2 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setFormData({
                          memberId: member.id,
                          amount: '',
                          notes: ''
                        });
                        setIsModalOpen(true);
                      }}
                      className="w-full py-2 px-3 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      Add Contribution
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {members.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">Add members first to manage contributions.</p>
        </div>
      )}

      {/* Modal */}
      {canManage && isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingContribution ? 'Edit Contribution' : 'Add New Contribution'}
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
            {formData.memberId && !editingContribution && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Adding contribution for:</span> {
                    members.find(m => m.id === formData.memberId)?.name || 'Selected Member'
                  }
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member *
                </label>
                <select
                  required
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  className="input-field"
                  disabled={formData.memberId && !editingContribution}
                >
                  <option value="">Select member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {formData.memberId && !editingContribution && (
                  <p className="text-xs text-gray-500 mt-1">
                    Member pre-selected from the list above
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contribution Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter contribution amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingContribution ? 'Update' : 'Add'} Contribution
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
