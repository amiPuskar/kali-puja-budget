'use client';

import { useState, useEffect } from 'react';
import { Save, DollarSign, Target, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { usePuja } from '@/contexts/PujaContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Budget() {
  const { 
    budgetItems, 
    budgetAllocations, 
    setBudgetItems, 
    setBudgetAllocations, 
    expenses,
    getTotalCollected
  } = useStore();
  const { currentPuja } = usePuja();
  const { isAdmin } = useAuth();
  const canManage = isAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [allocations, setAllocations] = useState({}); // { budgetItemId: amount }

  useEffect(() => {
    let loadedCount = 0;
    const totalSubscriptions = currentPuja ? 2 : 1;

    const checkLoadingComplete = () => {
      loadedCount++;
      if (loadedCount >= totalSubscriptions) {
        setIsLoading(false);
      }
    };

    // Subscribe to budget items (not puja-specific)
    const unsubscribeBudgetItems = subscribeToCollection(COLLECTIONS.BUDGET_ITEMS, (data) => {
      setBudgetItems(data || []);
      checkLoadingComplete();
    });
    
    if (currentPuja) {
      // Subscribe to budget allocations for current puja
      const unsubscribeBudgetAllocations = subscribeToCollection(`${COLLECTIONS.BUDGET_ALLOCATIONS}_${currentPuja.id}`, (data) => {
        setBudgetAllocations(data || []);
        
        // Convert allocations to a simple object for easy editing
        const allocationsObj = {};
        (data || []).forEach(allocation => {
          allocationsObj[allocation.budgetItemId] = allocation.allocatedAmount || 0;
        });
        setAllocations(allocationsObj);
        
        checkLoadingComplete();
      });
      
      return () => {
        unsubscribeBudgetItems();
        unsubscribeBudgetAllocations();
      };
    }
    
    return () => {
      unsubscribeBudgetItems();
    };
  }, [currentPuja, setBudgetItems, setBudgetAllocations]);

  const handleAmountChange = (budgetItemId, amount) => {
    setAllocations(prev => ({
      ...prev,
      [budgetItemId]: parseFloat(amount) || 0
    }));
  };

  const saveAllocations = async () => {
    if (!currentPuja) {
      toast.error('Please select a puja first');
      return;
    }

    try {
      // Get existing allocations
      const existingAllocations = budgetAllocations || [];
      
      // Process each budget item
      for (const budgetItem of budgetItems) {
        const amount = allocations[budgetItem.id] || 0;
        const existingAllocation = existingAllocations.find(a => a.budgetItemId === budgetItem.id);
        
        if (amount > 0) {
          // Create or update allocation
          const allocationData = {
            budgetItemId: budgetItem.id,
            budgetItemName: budgetItem.name,
            budgetItemCategory: budgetItem.category,
            allocatedAmount: amount,
            pujaId: currentPuja.id,
            pujaName: currentPuja.name
          };
          
          if (existingAllocation) {
            await updateDocument(`${COLLECTIONS.BUDGET_ALLOCATIONS}_${currentPuja.id}`, existingAllocation.id, allocationData);
          } else {
            await addDocument(`${COLLECTIONS.BUDGET_ALLOCATIONS}_${currentPuja.id}`, allocationData);
          }
        } else if (existingAllocation) {
          // Delete allocation if amount is 0
          await deleteDocument(`${COLLECTIONS.BUDGET_ALLOCATIONS}_${currentPuja.id}`, existingAllocation.id);
        }
      }
      
      toast.success('Budget allocations saved successfully');
    } catch (error) {
      console.error('Error saving budget allocations:', error);
      toast.error('Failed to save budget allocations');
    }
  };

  const quickFixUnallocated = () => {
    const newAllocations = { ...allocations };
    let fixedCount = 0;
    
    budgetItems.forEach(item => {
      const allocated = allocations[item.id] || 0;
      const spent = getSpentAmount(item.name);
      
      // If no allocation but there are expenses, set allocation to spent amount
      if (allocated === 0 && spent > 0) {
        newAllocations[item.id] = spent;
        fixedCount++;
      }
    });
    
    if (fixedCount > 0) {
      setAllocations(newAllocations);
      toast.success(`Quick fix applied to ${fixedCount} item(s). Click "Save Allocations" to confirm.`);
    } else {
      toast.info('No items need quick fixing.');
    }
  };

  // Calculate totals
  const totalAvailable = currentPuja ? getTotalCollected() : 0;
  const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + (amount || 0), 0);
  const totalSpent = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const remainingBudget = totalAvailable - totalAllocated;

  // Get spent amount for each budget item
  const getSpentAmount = (budgetItemName) => {
    return expenses
      .filter(expense => expense.category === budgetItemName)
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  };

  // Get budget status
  const getBudgetStatus = (budgetItem) => {
    const allocated = allocations[budgetItem.id] || 0;
    const spent = getSpentAmount(budgetItem.name);
    
    // If no allocation but there are expenses, it's over budget
    if (allocated === 0 && spent > 0) {
      return { status: 'no-allocation', color: 'red', icon: AlertTriangle };
    }
    
    const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
    
    if (percentage >= 100) {
      return { status: 'over-budget', color: 'red', icon: AlertTriangle };
    } else if (percentage >= 80) {
      return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    } else if (percentage >= 50) {
      return { status: 'on-track', color: 'blue', icon: Clock };
    } else {
      return { status: 'good', color: 'green', icon: CheckCircle };
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading budget..." />;
  }

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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Allocations</h1>
            <p className="text-sm text-gray-600 mt-1">
              Allocate budget for <span className="font-medium text-blue-600">{currentPuja.name}</span>
            </p>
          </div>
          {canManage && (
            <div className="flex flex-col sm:flex-row gap-3">
              {(() => {
                const itemsNeedingFix = budgetItems.filter(item => {
                  const allocated = allocations[item.id] || 0;
                  const spent = getSpentAmount(item.name);
                  return allocated === 0 && spent > 0;
                });
                
                if (itemsNeedingFix.length > 0) {
                  return (
                    <button
                      onClick={quickFixUnallocated}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Quick Fix ({itemsNeedingFix.length})</span>
                    </button>
                  );
                }
                return null;
              })()}
              <button
                onClick={saveAllocations}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Allocations</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Help Text - Only for Admins */}
        {canManage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-xs font-bold">i</span>
              </div>
              <p className="text-sm text-blue-800">
                Add amounts for each category below. Use "Quick Fix" for categories with expenses, then "Save Allocations".
              </p>
            </div>
          </div>
        )}
      </div>

      {!canManage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <p className="text-xs text-yellow-700">View-only access. Contact admin to manage budget allocations.</p>
        </div>
      )}

      {/* Budget Overview - Original Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 mr-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Available</p>
              <p className="text-xl font-semibold text-gray-900">₹{totalAvailable.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100 mr-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Budget Allocated</p>
              <p className="text-xl font-semibold text-gray-900">₹{totalAllocated.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-red-100 mr-4">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Spent</p>
              <p className="text-xl font-semibold text-gray-900">₹{totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100 mr-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Remaining</p>
              <p className={`text-xl font-semibold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{remainingBudget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Alerts - Small Notification */}
      {(() => {
        const itemsWithIssues = budgetItems.filter(item => {
          const allocated = allocations[item.id] || 0;
          const spent = getSpentAmount(item.name);
          return (allocated === 0 && spent > 0) || (allocated > 0 && spent > allocated);
        });
        
        if (itemsWithIssues.length > 0) {
          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    {itemsWithIssues.length} budget item(s) need attention
                  </span>
                </div>
                {canManage && (
                  <button
                    onClick={quickFixUnallocated}
                    className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 transition-colors"
                  >
                    Quick Fix
                  </button>
                )}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Budget Items - Row Design */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Categories</h3>
        <div className="space-y-3">
          {budgetItems.map((budgetItem) => {
            const allocated = allocations[budgetItem.id] || 0;
            const spent = getSpentAmount(budgetItem.name);
            const remaining = allocated - spent;
            const spentPercentage = allocated > 0 ? (spent / allocated) * 100 : 0;
            const budgetStatus = getBudgetStatus(budgetItem);
            const StatusIcon = budgetStatus.icon;
            
            return (
              <div key={budgetItem.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{budgetItem.name}</h4>
                        <StatusIcon className={`w-4 h-4 ${
                          budgetStatus.color === 'red' ? 'text-red-500' :
                          budgetStatus.color === 'yellow' ? 'text-yellow-500' :
                          budgetStatus.color === 'blue' ? 'text-blue-500' :
                          'text-green-500'
                        }`} />
                      </div>
                      <p className="text-xs text-gray-500 truncate">{budgetItem.description}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {budgetItem.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Amount Input */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Budget Amount</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={allocated}
                          onChange={(e) => handleAmountChange(budgetItem.id, e.target.value)}
                          disabled={!canManage}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar and Stats - Only show if there's data */}
                {(allocated > 0 || spent > 0) && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Spent: ₹{spent.toLocaleString()}</span>
                      {allocated > 0 ? (
                        <>
                          <span>Remaining: ₹{remaining.toLocaleString()}</span>
                          <span className={`font-medium ${
                            spentPercentage > 100 ? 'text-red-600' :
                            spentPercentage > 80 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {spentPercentage.toFixed(1)}% used
                          </span>
                        </>
                      ) : (
                        <span className="font-medium text-red-600">
                          No budget allocated
                        </span>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          spentPercentage > 100 ? 'bg-red-500' :
                          spentPercentage > 80 ? 'bg-yellow-500' :
                          spentPercentage > 50 ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: allocated > 0 ? `${Math.min(spentPercentage, 100)}%` : '100%' }}
                      ></div>
                    </div>
                    
                    {/* Alert Messages */}
                    {allocated === 0 && spent > 0 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center">
                          <AlertTriangle className="w-3 h-3 text-red-600 mr-1" />
                          <p className="text-xs text-red-700">
                            No budget allocated but ₹{spent.toLocaleString()} spent!
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {allocated > 0 && spentPercentage > 100 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center">
                          <AlertTriangle className="w-3 h-3 text-red-600 mr-1" />
                          <p className="text-xs text-red-700">
                            Over budget by ₹{(spent - allocated).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {budgetItems.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No budget items</h3>
          <p className="mt-1 text-sm text-gray-500">Please add budget items first before allocating amounts.</p>
        </div>
      )}
    </div>
  );
}