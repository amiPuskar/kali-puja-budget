'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Calendar, X } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { usePuja } from '@/contexts/PujaContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ParaCollection() {
  const { paraCollections, setParaCollections } = useStore();
  const { currentPuja } = usePuja();
  const { isAdmin } = useAuth();
  const canManage = isAdmin ? isAdmin() : false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    collectedBy: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentPuja) return;
    
    const unsubscribe = subscribeToCollection(
      `${COLLECTIONS.PARA_COLLECTIONS}_${currentPuja.id}`, 
      (data) => {
        setParaCollections(data || []);
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [currentPuja, setParaCollections]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPuja) {
      toast.error('Please select a puja first');
      return;
    }

    if (!formData.amount || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const collectionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        pujaId: currentPuja.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingCollection) {
        await updateDocument(`${COLLECTIONS.PARA_COLLECTIONS}_${currentPuja.id}`, editingCollection.id, {
          ...collectionData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Para collection updated successfully');
      } else {
        await addDocument(`${COLLECTIONS.PARA_COLLECTIONS}_${currentPuja.id}`, collectionData);
        toast.success('Para collection added successfully');
      }

      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        collectedBy: ''
      });
      setIsModalOpen(false);
      setEditingCollection(null);
    } catch (error) {
      console.error('Error saving para collection:', error);
      toast.error('Failed to save para collection');
    }
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setFormData({
      amount: collection.amount.toString(),
      date: collection.date,
      notes: collection.notes || '',
      collectedBy: collection.collectedBy || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!currentPuja) return;
    
    if (window.confirm('Are you sure you want to delete this para collection?')) {
      try {
        await deleteDocument(`${COLLECTIONS.PARA_COLLECTIONS}_${currentPuja.id}`, id);
        toast.success('Para collection deleted successfully');
      } catch (error) {
        console.error('Error deleting para collection:', error);
        toast.error('Failed to delete para collection');
      }
    }
  };

  const totalCollected = paraCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0);

  if (isLoading) {
    return <LoadingSpinner message="Loading para collections..." />;
  }

  if (!currentPuja) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Puja Selected</h3>
        <p className="mt-1 text-sm text-gray-500">Please select a puja to manage para collections.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Para Collection"
        description={`Manage para collections for ${currentPuja.name}`}
        buttonText="Add Collection"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
        showButton={canManage}
      />

      {!canManage && (
        <div className="card">
          <p className="text-sm text-gray-600">You have view-only access. Please contact an admin to add or update para collections.</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-xl font-semibold text-gray-900">₹{totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collections</p>
              <p className="text-xl font-semibold text-gray-900">{paraCollections.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collected By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                {canManage && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paraCollections.map((collection) => (
                <tr key={collection.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(collection.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ₹{collection.amount?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{collection.collectedBy || '-'}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {collection.notes || '-'}
                    </div>
                  </td>
                  {canManage && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(collection)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit collection"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(collection.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete collection"
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
        {paraCollections.map((collection) => (
          <div key={collection.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {new Date(collection.date).toLocaleDateString()}
                  </h3>
                  <p className="text-xs text-gray-500">{collection.collectedBy || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">
                  ₹{collection.amount?.toLocaleString() || 0}
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {collection.notes && (
              <div className="mb-3">
                <p className="text-xs text-gray-500">{collection.notes}</p>
              </div>
            )}
            
            {/* Actions */}
            {canManage && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(collection)}
                  className="flex-1 py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(collection.id)}
                  className="flex-1 py-2 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {paraCollections.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No para collections</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first para collection.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-11/12 sm:w-96 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCollection ? 'Edit Collection' : 'Add Para Collection'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCollection(null);
                  setFormData({
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                    collectedBy: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collected By
                </label>
                <input
                  type="text"
                  value={formData.collectedBy}
                  onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter collector name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add any notes about this collection"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCollection(null);
                    setFormData({
                      amount: '',
                      date: new Date().toISOString().split('T')[0],
                      notes: '',
                      collectedBy: ''
                    });
                  }}
                  className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingCollection ? 'Update' : 'Add Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
