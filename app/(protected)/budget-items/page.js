'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, X } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import { hasPermission } from '@/lib/roles';

export default function BudgetItems() {
  const { budgetItems, setBudgetItems } = useStore();
  const { user } = useAuth();
  const canManage = hasPermission(user?.role, 'canManageBudgetItems');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    notes: ''
  });

  useEffect(() => {
    const unsubscribe = subscribeToCollection(COLLECTIONS.BUDGET_ITEMS, setBudgetItems);
    return () => unsubscribe();
  }, [setBudgetItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...formData
      };

      if (editingItem) {
        await updateDocument(COLLECTIONS.BUDGET_ITEMS, editingItem.id, itemData);
        toast.success('Budget item updated');
      } else {
        await addDocument(COLLECTIONS.BUDGET_ITEMS, itemData);
        toast.success('Budget item added');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving budget item:', error);
      toast.error('Failed to save budget item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget item?')) {
      try {
        await deleteDocument(COLLECTIONS.BUDGET_ITEMS, id);
        toast.success('Budget item deleted');
      } catch (error) {
        console.error('Error deleting budget item:', error);
        toast.error('Failed to delete budget item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      notes: ''
    });
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const categories = [
    'Decoration',
    'Food & Catering',
    'Puja Materials',
    'Sound & Lighting',
    'Transportation',
    'Security',
    'Entertainment',
    'Miscellaneous'
  ];

  // Members can view read-only; admins can manage

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Budget Items"
          description="Manage default budget items (prices are set per puja)"
          showButton={false}
        />
        <div className="card text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">Access Denied</p>
            <p>Only Admins can manage budget items.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Items"
        description="Manage default budget items (prices are set per puja)"
        buttonText="Add Budget Item"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
        showButton={canManage}
      />

      {!canManage && (
        <div className="card">
          <p className="text-sm text-gray-600">You have view-only access. Please contact an admin to add or update budget items.</p>
        </div>
      )}

      {/* Summary Card */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget Items</p>
              <p className="text-2xl font-semibold text-gray-900">{budgetItems.length}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Categories</p>
            <p className="text-2xl font-semibold text-gray-900">
              {new Set(budgetItems.map(item => item.category)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Budget Items List */}
      <div className="space-y-4">
        {budgetItems.map((item) => (
          <div key={item.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{item.notes}</p>
                  )}
                </div>
              </div>
              {canManage && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {budgetItems.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No budget items</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first budget item.</p>
        </div>
      )}

      {/* Modal */}
      {canManage && isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Edit Budget Item' : 'Add New Budget Item'}
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
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter budget item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter item description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
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
                  {editingItem ? 'Update' : 'Add'} Budget Item
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
