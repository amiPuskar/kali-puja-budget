'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, Mail, Phone, Clock, UserCheck } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ROLE_OPTIONS } from '@/lib/roles';

export default function PendingMembers() {
  const { pendingMembers, setPendingMembers } = useStore();
  const { isSuperAdmin, user } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    role: 'Member',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(COLLECTIONS.PENDING_MEMBERS, (data) => {
      setPendingMembers(data || []);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [setPendingMembers]);

  const handleApprove = async (member) => {
    setSelectedMember(member);
    setApprovalData({
      role: 'Member',
      notes: ''
    });
    setShowApprovalModal(true);
  };

  const handleReject = async (member) => {
    if (window.confirm(`Are you sure you want to reject ${member.name}'s membership request?`)) {
      try {
        await updateDocument(COLLECTIONS.PENDING_MEMBERS, member.id, {
          status: 'rejected',
          reviewedBy: user.name,
          reviewedAt: new Date().toISOString(),
          rejectionNotes: 'Rejected by Super Admin'
        });
        toast.success('Membership request rejected');
      } catch (error) {
        console.error('Error rejecting member:', error);
        toast.error('Failed to reject membership request');
      }
    }
  };

  const handleFinalApproval = async () => {
    if (!selectedMember) return;

    try {
      // Add to approved members
      const memberData = {
        name: selectedMember.name,
        email: selectedMember.email,
        contact: selectedMember.contact,
        password: selectedMember.password,
        role: approvalData.role,
        approvedBy: user.name,
        approvedAt: new Date().toISOString(),
        status: 'active'
      };

      await addDocument(COLLECTIONS.MEMBERS, memberData);

      // Update pending member status to approved
      await updateDocument(COLLECTIONS.PENDING_MEMBERS, selectedMember.id, {
        status: 'approved',
        approvedRole: approvalData.role,
        reviewedBy: user.name,
        reviewedAt: new Date().toISOString(),
        approvalNotes: approvalData.notes
      });

      toast.success('Member approved and added to the system');
      setShowApprovalModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Failed to approve member');
    }
  };

  const pendingRequests = pendingMembers.filter(member => member.status === 'pending');
  const approvedRequests = pendingMembers.filter(member => member.status === 'approved');
  const rejectedRequests = pendingMembers.filter(member => member.status === 'rejected');

  if (isLoading) {
    return <LoadingSpinner message="Loading pending members..." />;
  }

  if (!isSuperAdmin()) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">Only Super Admin can manage pending members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Pending Members"
        description="Review and approve new member registrations"
        showButton={false}
      />


      {/* Summary Cards - Responsive Design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card py-3 px-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-md">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">{pendingRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="card py-3 px-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-md">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Approved</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">{approvedRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="card py-3 px-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-red-100 rounded-md">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Rejected</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">{rejectedRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">Pending Requests</h3>
        {pendingRequests.length === 0 ? (
          <div className="card">
            <p className="text-gray-500 text-sm">No pending membership requests</p>
          </div>
        ) : (
          <>
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
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingRequests.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-lg">
                              <User className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.contact}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(member.requestedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(member)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Approve member"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(member)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Reject member"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Mobile List - Individual Cards */}
            <div className="sm:hidden space-y-3">
              {pendingRequests.map((member) => (
                <div key={member.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
                        <User className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                        <p className="text-xs text-gray-500">{member.contact}</p>
                      </div>
                    </div>
                    
                    <div className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs font-medium">
                      Pending
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">{member.email}</p>
                    <p className="text-xs text-gray-400">
                      Requested: {new Date(member.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(member)}
                      className="flex-1 py-2 px-3 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(member)}
                      className="flex-1 py-2 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Approved Requests - Responsive */}
      {approvedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-medium text-gray-900">Recently Approved ({approvedRequests.length})</h3>
          <div className="grid grid-cols-1 gap-2">
            {approvedRequests.slice(0, 5).map((member) => (
              <div key={member.id} className="card py-2 px-3 bg-green-50 border-green-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                        <span className="text-sm font-medium text-gray-900 truncate">{member.name}</span>
                        <span className="text-xs text-green-600">({member.approvedRole})</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        Approved by: {member.reviewedBy || member.approvedBy || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(member.reviewedAt || member.approvedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {approvedRequests.length > 5 && (
              <p className="text-xs text-gray-500 text-center py-1">
                +{approvedRequests.length - 5} more approved
              </p>
            )}
          </div>
        </div>
      )}

      {/* Rejected Requests - Responsive */}
      {rejectedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-medium text-gray-900">Recently Rejected ({rejectedRequests.length})</h3>
          <div className="grid grid-cols-1 gap-2">
            {rejectedRequests.slice(0, 5).map((member) => (
              <div key={member.id} className="card py-2 px-3 bg-red-50 border-red-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                        <span className="text-sm font-medium text-gray-900 truncate">{member.name}</span>
                        <span className="text-xs text-red-600">Rejected</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        Rejected by: {member.reviewedBy || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(member.reviewedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {rejectedRequests.length > 5 && (
              <p className="text-xs text-gray-500 text-center py-1">
                +{rejectedRequests.length - 5} more rejected
              </p>
            )}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Approve Member: {selectedMember.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Role *
                  </label>
                  <select
                    value={approvalData.role}
                    onChange={(e) => setApprovalData({ ...approvalData, role: e.target.value })}
                    className="input-field"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Notes
                  </label>
                  <textarea
                    value={approvalData.notes}
                    onChange={(e) => setApprovalData({ ...approvalData, notes: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Optional notes about this approval"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleFinalApproval}
                    className="btn-primary flex-1"
                  >
                    Approve & Add Member
                  </button>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
