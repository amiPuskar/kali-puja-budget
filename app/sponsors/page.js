'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, DollarSign, Building, User } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { COLLECTIONS } from '@/lib/firebase';
import PageHeader from '@/components/PageHeader';

export default function Sponsors() {
  const { sponsors, setSponsors } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'individual',
    amount: '',
    contact: '',
    email: '',
    address: '',
    notes: '',
    received: false
  });

  useEffect(() => {
    const unsubscribe = subscribeToCollection(COLLECTIONS.SPONSORS, setSponsors);
    return () => unsubscribe();
  }, [setSponsors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sponsorData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0
      };
      
      if (editingSponsor) {
        await updateDocument(COLLECTIONS.SPONSORS, editingSponsor.id, sponsorData);
        toast.success('Sponsor updated');
      } else {
        await addDocument(COLLECTIONS.SPONSORS, sponsorData);
        toast.success('Sponsor added');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      toast.error('Failed to save sponsor');
    }
  };

  const handleEdit = (sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name || '',
      type: sponsor.type || 'individual',
      amount: sponsor.amount?.toString() || '',
      contact: sponsor.contact || '',
      email: sponsor.email || '',
      address: sponsor.address || '',
      notes: sponsor.notes || '',
      received: sponsor.received || false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sponsor?')) {
      try {
        await deleteDocument(COLLECTIONS.SPONSORS, id);
      } catch (error) {
        console.error('Error deleting sponsor:', error);
      }
    }
  };

  const toggleReceivedStatus = async (sponsor) => {
    try {
      await updateDocument(COLLECTIONS.SPONSORS, sponsor.id, {
        received: !sponsor.received
      });
    } catch (error) {
      console.error('Error updating sponsor status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'individual',
      amount: '',
      contact: '',
      email: '',
      address: '',
      notes: '',
      received: false
    });
    setEditingSponsor(null);
    setIsModalOpen(false);
  };

  const receivedSponsors = sponsors.filter(sponsor => sponsor.received);
  const pendingSponsors = sponsors.filter(sponsor => !sponsor.received);
  const totalDonations = sponsors.reduce((sum, sponsor) => sum + (sponsor.amount || 0), 0);
  const receivedAmount = receivedSponsors.reduce((sum, sponsor) => sum + (sponsor.amount || 0), 0);
  const pendingAmount = pendingSponsors.reduce((sum, sponsor) => sum + (sponsor.amount || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Sponsors & Donations"
        description="Track sponsors and their contributions"
        buttonText="Add Sponsor"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalDonations.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Received</p>
              <p className="text-2xl font-semibold text-gray-900">₹{receivedAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg">
              <Building className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">₹{pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sponsors</p>
              <p className="text-2xl font-semibold text-gray-900">{sponsors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Sponsors */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Donations</h3>
        {pendingSponsors.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending donations</p>
        ) : (
          <div className="space-y-4">
            {pendingSponsors.map((sponsor) => (
              <div key={sponsor.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleReceivedStatus(sponsor)}
                    className="w-5 h-5 border-2 border-orange-300 rounded hover:border-green-500 transition-colors"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{sponsor.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{sponsor.type}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm font-semibold text-green-600">
                        ₹{sponsor.amount?.toLocaleString() || 0}
                      </span>
                      {sponsor.contact && (
                        <span className="text-xs text-gray-600">
                          {sponsor.contact}
                        </span>
                      )}
                    </div>
                    {sponsor.notes && (
                      <p className="text-xs text-gray-500 mt-1">{sponsor.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    Pending
                  </span>
                  <button
                    onClick={() => handleEdit(sponsor)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sponsor.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Received Sponsors */}
      {receivedSponsors.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Received Donations</h3>
          <div className="space-y-4">
            {receivedSponsors.map((sponsor) => (
              <div key={sponsor.id} className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                    <Gift className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{sponsor.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{sponsor.type}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm font-semibold text-green-600">
                        ₹{sponsor.amount?.toLocaleString() || 0}
                      </span>
                      {sponsor.contact && (
                        <span className="text-xs text-gray-600">
                          {sponsor.contact}
                        </span>
                      )}
                    </div>
                    {sponsor.notes && (
                      <p className="text-xs text-gray-500 mt-1">{sponsor.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    Received
                  </span>
                  <button
                    onClick={() => handleEdit(sponsor)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sponsor.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name/Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter name or organization"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Donation Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    placeholder="Enter donation amount"
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Enter address (optional)"
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
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="received"
                    checked={formData.received}
                    onChange={(e) => setFormData({ ...formData, received: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="received" className="ml-2 block text-sm text-gray-900">
                    Donation has been received
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingSponsor ? 'Update' : 'Add'} Sponsor
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
