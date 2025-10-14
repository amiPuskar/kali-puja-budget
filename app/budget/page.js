'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Target, TrendingUp } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import PageHeader from '@/components/PageHeader';

export default function Budget() {
  const { budget, setBudget, expenses } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    allocatedAmount: '',
    notes: ''
  });

  useEffect(() => {
    const unsubscribe = subscribeToCollection(COLLECTIONS.BUDGET, setBudget);
    return () => unsubscribe();
  }, [setBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetData = {
        ...formData,
        allocatedAmount: parseFloat(formData.allocatedAmount) || 0
      };
      
      if (editingItem) {
        await updateDocument(COLLECTIONS.BUDGET, editingItem.id, budgetData);
        toast.success('Budget item updated');
      } else {
        await addDocument(COLLECTIONS.BUDGET, budgetData);
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
      allocatedAmount: item.allocatedAmount?.toString() || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget item?')) {
      try {
        await deleteDocument(COLLECTIONS.BUDGET, id);
      } catch (error) {
        console.error('Error deleting budget item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      allocatedAmount: '',
      notes: ''
    });
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const totalBudget = budget.reduce((sum, item) => sum + (item.allocatedAmount || 0), 0);

  // Calculate spent amount for each budget item
  const getSpentAmount = (budgetItemName) => {
    return expenses
      .filter(expense => expense.category === budgetItemName)
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  };

  const getRemainingAmount = (budgetItem) => {
    const spent = getSpentAmount(budgetItem.name);
    return (budgetItem.allocatedAmount || 0) - spent;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Budget Planning"
        description="Plan and allocate budget for different items and services"
        buttonText="Add Budget Item"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
      />

      {/* Summary Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 sm:p-3 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget Allocated</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">₹{totalBudget.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-medium text-gray-600">Budget Items</p>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">{budget.length}</p>
          </div>
        </div>
      </div>

      {/* Budget Items Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budget.map((item) => {
          const spent = getSpentAmount(item.name);
          const remaining = getRemainingAmount(item);
          const spentPercentage = item.allocatedAmount > 0 ? (spent / item.allocatedAmount) * 100 : 0;
          
          return (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
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
              </div>
              
              <div className="space-y-3">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900">{spentPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        spentPercentage > 100 ? 'bg-red-500' : 
                        spentPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs sm:text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Allocated</p>
                    <p className="font-semibold text-blue-600 text-xs sm:text-sm">₹{item.allocatedAmount?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Spent</p>
                    <p className="font-semibold text-red-600 text-xs sm:text-sm">₹{spent.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Remaining</p>
                    <p className={`font-semibold text-xs sm:text-sm ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {budget.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No budget items</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first budget item.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit Budget Item' : 'Add New Budget Item'}
              </h3>
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
                    placeholder="e.g., Pandal, Mic Set, Lighting"
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
                    Allocated Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.allocatedAmount}
                    onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
                    className="input-field"
                    placeholder="Enter allocated amount"
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
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
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
        </div>
      )}
    </div>
  );
}
