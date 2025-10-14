'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Receipt, Calendar, Tag, X } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import PageHeader from '@/components/PageHeader';

export default function Expenses() {
  const { 
    expenses, setExpenses, 
    budget, setBudget, 
    getBudgetCategories,
    currentClubId, currentYear,
    getFilteredExpenses
  } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const unsubscribeExpenses = subscribeToCollection(COLLECTIONS.EXPENSES, setExpenses);
    const unsubscribeBudget = subscribeToCollection(COLLECTIONS.BUDGET, setBudget);
    return () => {
      unsubscribeExpenses();
      unsubscribeBudget();
    };
  }, [setExpenses, setBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        date: new Date(formData.date).toISOString(),
        clubId: currentClubId || null,
        year: currentYear || new Date(formData.date).getFullYear()
      };
      
      if (editingExpense) {
        await updateDocument(COLLECTIONS.EXPENSES, editingExpense.id, expenseData);
        setEditingExpense(null);
        setIsModalOpen(false);
        setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
        toast.success('Expense updated');
      } else {
        await addDocument(COLLECTIONS.EXPENSES, expenseData);
        setEditingExpense(null);
        setIsModalOpen(false);
        setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
        toast.success('Expense added');
      }
      // resetForm();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description || '',
      amount: expense.amount?.toString() || '',
      category: expense.category || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: expense.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteDocument(COLLECTIONS.EXPENSES, id);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const filteredExpenses = getFilteredExpenses();

  // Get categories from budget items plus default categories
  const budgetCategories = getBudgetCategories();
  const defaultCategories = [
    'Decoration',
    'Food & Catering',
    'Puja Materials',
    'Sound & Lighting',
    'Transportation',
    'Miscellaneous'
  ];
  const categories = [...budgetCategories, ...defaultCategories];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Expenses"
        description="Track and manage all expenses for Puja"
        buttonText="Add Expense"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
      />

      {/* Summary Card */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
              <Receipt className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Total Items</p>
            <p className="text-2xl font-semibold text-gray-900">{expenses.length}</p>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
                  <Receipt className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                    {expense.category && (
                      <div className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {expense.category}
                        </span>
                      </div>
                    )}
                  </div>
                  {expense.notes && (
                    <p className="mt-2 text-sm text-gray-600">{expense.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-red-600">
                    ₹{expense.amount?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first expense.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
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
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="Enter expense description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
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
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
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
                    {editingExpense ? 'Update' : 'Add'} Expense
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
