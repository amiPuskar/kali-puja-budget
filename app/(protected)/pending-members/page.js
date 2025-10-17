'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, Mail, Phone, Clock, UserCheck } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
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

  useEffect(() => {
    console.log('Subscribing to pending members collection:', COLLECTIONS.PENDING_MEMBERS);
    const unsubscribe = subscribeToCollection(COLLECTIONS.PENDING_MEMBERS, (data) => {
      console.log('Pending members data received:', data);
      console.log('Data length:', data.length);
      setPendingMembers(data);
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

      // Update pending member status
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
    <div className="space-y-6">
      <PageHeader
        title="Pending Members"
        description="Review and approve new member registrations"
        showButton={false}
      />

      {/* Debug Info */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Info</h3>
        <p className="text-xs text-gray-600">Total pending members: {pendingMembers.length}</p>
        <p className="text-xs text-gray-600">Collection: {COLLECTIONS.PENDING_MEMBERS}</p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => console.log('Current pending members:', pendingMembers)}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded"
          >
            Log to Console
          </button>
          <button 
            onClick={() => {
              console.log('Refreshing pending members...');
              // Force re-subscription
              const unsubscribe = subscribeToCollection(COLLECTIONS.PENDING_MEMBERS, (data) => {
                console.log('Refreshed data:', data);
                setPendingMembers(data);
              });
              setTimeout(() => unsubscribe(), 1000);
            }}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded"
          >
            Refresh Data
          </button>
          <button 
            onClick={async () => {
              try {
                const testData = {
                  name: 'Test User',
                  email: 'test@example.com',
                  contact: '1234567890',
                  password: 'test123',
                  status: 'pending',
                  requestedAt: new Date().toISOString(),
                  role: 'Member',
                  approvedBy: null,
                  approvedAt: null
                };
                await addDocument(COLLECTIONS.PENDING_MEMBERS, testData);
                console.log('Test member created');
                toast.success('Test member created');
              } catch (error) {
                console.error('Error creating test member:', error);
                toast.error('Failed to create test member');
              }
            }}
            className="px-3 py-1 bg-yellow-500 text-white text-xs rounded"
          >
            Create Test Member
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{approvedRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">{rejectedRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Pending Requests</h3>
        {pendingRequests.length === 0 ? (
          <div className="card">
            <p className="text-gray-500 text-sm">No pending membership requests</p>
          </div>
        ) : (
          pendingRequests.map((member) => (
            <div key={member.id} className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                    <User className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{member.contact}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Requested: {new Date(member.requestedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(member)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(member)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approved Requests */}
      {approvedRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Recently Approved</h3>
          {approvedRequests.map((member) => (
            <div key={member.id} className="card bg-green-50 border-green-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-xs text-green-600">
                    Approved as {member.approvedRole} by {member.reviewedBy} on {new Date(member.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
