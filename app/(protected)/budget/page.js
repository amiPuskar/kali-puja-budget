'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Target, TrendingUp, X } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { usePuja } from '@/contexts/PujaContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';

export default function Budget() {
  const { 
    budgetItems, 
    budgetAllocations, 
    setBudgetItems, 
    setBudgetAllocations, 
    expenses,
    getBudgetAllocationsForPuja,
    getBudgetItemAllocation,
    getTotalAllocatedForPuja
  } = useStore();
  const { currentPuja } = usePuja();
  const { isAdmin } = useAuth();
  const canManage = isAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [formData, setFormData] = useState({
    budgetItemId: '',
    allocatedAmount: '',
    notes: ''
  });

  useEffect(() => {
    // Subscribe to budget items (not puja-specific)
    const unsubscribeBudgetItems = subscribeToCollection(COLLECTIONS.BUDGET_ITEMS, setBudgetItems);
    
    if (currentPuja) {
      // Subscribe to budget allocations for current puja
      const unsubscribeBudgetAllocations = subscribeToCollection(`${COLLECTIONS.BUDGET_ALLOCATIONS}_${currentPuja.id}`, setBudgetAllocations);
      
      return () => {
        unsubscribeBudgetItems();
        unsubscribeBudgetAllocations();
      };
    }
    
    return () => {
      unsubscribeBudgetItems();
    };
  }, [currentPuja, setBudgetItems, setBudgetAllocations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPuja) {
      toast.error('Please select a puja first');
      return;
    }

    try {
      const allocationData = {
        ...formData,
        allocatedAmount: parseFloat(formData.allocatedAmount) || 0,
        pujaId: currentPuja.id,
        pujaName: currentPuja.name
      };

      if (editingAllocation) {
        await updateDocument(`${COLLECTIONS.BUDGET_ALLOCATIONS}_${currentPuja.id}`, editingAllocation.id, allocationData);
        toast.success('Budget allocation updated');
      } else {
        await addDocument(`${COLLECTIONS.BUDGET_ALLOCATIONS}_${currentPuja.id}`, allocationData);
        toast.success('Budget allocation added');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving budget allocation:', error);
      toast.error('Failed to save budget allocation');
    }
  };

  const handleEdit = (allocation) => {
    setEditingAllocation(allocation);
    setFormData({
      budgetItemId: allocation.budgetItemId || '',
      allocatedAmount: allocation.allocatedAmount?.toString() || '',
      notes: allocation.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!currentPuja) return;
    
    if (window.confirm('Are you sure you want to delete this budget allocation?')) {
      try {
        await deleteDocument(`${COLLECTIONS.BUDGET_ALLOCATIONS}_${currentPuja.id}`, id);
        toast.success('Budget allocation deleted');
      } catch (error) {
        console.error('Error deleting budget allocation:', error);
        toast.error('Failed to delete budget allocation');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      budgetItemId: '',
      allocatedAmount: '',
      notes: ''
    });
    setEditingAllocation(null);
    setIsModalOpen(false);
  };

  const totalBudget = currentPuja ? getTotalAllocatedForPuja(currentPuja.id) : 0;
  const currentAllocations = currentPuja ? getBudgetAllocationsForPuja(currentPuja.id) : [];

  // Calculate spent amount for each budget item
  const getSpentAmount = (budgetItemName) => {
    return expenses
      .filter(expense => expense.category === budgetItemName)
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  };

  const getRemainingAmount = (allocation) => {
    const budgetItem = budgetItems.find(item => item.id === allocation.budgetItemId);
    if (!budgetItem) return 0;
    const spent = getSpentAmount(budgetItem.name);
    return (allocation.allocatedAmount || 0) - spent;
  };

  // Members can view read-only; admins can manage

  if (!currentPuja) {
    return (
      <div className="text-center py-12">
        <Target className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Puja Selected</h3>
        <p className="mt-1 text-sm text-gray-500">Please select a puja to manage budget allocations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Allocations"
        description={`Allocate budget for ${currentPuja.name} - Select from default budget items`}
        buttonText="Add Allocation"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
        showButton={canManage}
      />

      {!canManage && (
        <div className="card">
          <p className="text-sm text-gray-600">You have view-only access. Please contact an admin to add or update allocations.</p>
        </div>
      )}

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
            <p className="text-sm font-medium text-gray-600">Budget Allocations</p>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">{currentAllocations.length}</p>
          </div>
        </div>
      </div>

      {/* Budget Allocations List */}
      <div className="space-y-4">
        {currentAllocations.map((allocation) => {
          const budgetItem = budgetItems.find(item => item.id === allocation.budgetItemId);
          if (!budgetItem) return null;
          
          const spent = getSpentAmount(budgetItem.name);
          const remaining = getRemainingAmount(allocation);
          const spentPercentage = allocation.allocatedAmount > 0 ? (spent / allocation.allocatedAmount) * 100 : 0;
          
          return (
            <div key={allocation.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{budgetItem.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{budgetItem.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm font-semibold text-blue-600">
                        ₹{allocation.allocatedAmount?.toLocaleString() || 0}
                      </span>
                      <span className="text-xs text-gray-500">
                        Remaining: ₹{remaining.toLocaleString()}
                      </span>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {budgetItem.category}
                      </span>
                    </div>
                    {allocation.notes && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{allocation.notes}</p>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(allocation)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(allocation.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Spent: ₹{spent.toLocaleString()}</span>
                  <span>{spentPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      spentPercentage > 100 ? 'bg-red-500' :
                      spentPercentage > 80 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {currentAllocations.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No budget allocations</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first budget allocation.</p>
        </div>
      )}

      {/* Modal */}
      {canManage && isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAllocation ? 'Edit Budget Allocation' : 'Add New Budget Allocation'}
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
                  Budget Item *
                </label>
                <select
                  required
                  value={formData.budgetItemId}
                  onChange={(e) => setFormData({ ...formData, budgetItemId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select budget item</option>
                  {budgetItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category})
                    </option>
                  ))}
                </select>
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

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingAllocation ? 'Update' : 'Add'} Allocation
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