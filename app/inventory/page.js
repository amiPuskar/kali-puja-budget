'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, CheckCircle, Clock, ShoppingCart } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase';
import PageHeader from '@/components/PageHeader';

export default function Inventory() {
  const { inventory, setInventory } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    estimatedCost: '',
    received: false,
    notes: ''
  });

  useEffect(() => {
    const unsubscribe = subscribeToCollection(COLLECTIONS.INVENTORY, setInventory);
    return () => unsubscribe();
  }, [setInventory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0
      };
      
      if (editingItem) {
        await updateDocument(COLLECTIONS.INVENTORY, editingItem.id, itemData);
      } else {
        await addDocument(COLLECTIONS.INVENTORY, itemData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || '',
      quantity: item.quantity?.toString() || '',
      unit: item.unit || '',
      estimatedCost: item.estimatedCost?.toString() || '',
      received: item.received || false,
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDocument(COLLECTIONS.INVENTORY, id);
      } catch (error) {
        console.error('Error deleting inventory item:', error);
      }
    }
  };

  const toggleReceivedStatus = async (item) => {
    try {
      await updateDocument(COLLECTIONS.INVENTORY, item.id, {
        received: !item.received
      });
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      estimatedCost: '',
      received: false,
      notes: ''
    });
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const receivedItems = inventory.filter(item => item.received);
  const pendingItems = inventory.filter(item => !item.received);
  const totalEstimatedCost = inventory.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

  const categories = [
    'Flowers & Garlands',
    'Prasad & Food Items',
    'Decorations',
    'Puja Materials',
    'Lighting & Sound',
    'Transportation',
    'Miscellaneous'
  ];

  const units = ['pieces', 'kg', 'liters', 'packets', 'sets', 'meters'];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Inventory & Items"
        description="Track puja items, decorations, and supplies"
        buttonText="Add Item"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Received Items</p>
              <p className="text-2xl font-semibold text-gray-900">{receivedItems.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Items</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingItems.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Est. Cost</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalEstimatedCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Items */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Items</h3>
        {pendingItems.length === 0 ? (
          <p className="text-gray-500 text-sm">All items have been received</p>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleReceivedStatus(item)}
                    className="w-5 h-5 border-2 border-orange-300 rounded hover:border-green-500 transition-colors"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-600">
                        Qty: {item.quantity} {item.unit}
                      </span>
                      {item.estimatedCost > 0 && (
                        <span className="text-xs text-purple-600">
                          Est. ₹{item.estimatedCost.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    Pending
                  </span>
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
            ))}
          </div>
        )}
      </div>

      {/* Received Items */}
      {receivedItems.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Received Items</h3>
          <div className="space-y-4">
            {receivedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-600">
                        Qty: {item.quantity} {item.unit}
                      </span>
                      {item.estimatedCost > 0 && (
                        <span className="text-xs text-purple-600">
                          Est. ₹{item.estimatedCost.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    Received
                  </span>
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
                {editingItem ? 'Edit Item' : 'Add New Item'}
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
                    placeholder="Enter item name"
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select unit</option>
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
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
                    Item has been received
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingItem ? 'Update' : 'Add'} Item
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
