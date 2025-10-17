'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, User, X, CheckCircle, Clock } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { COLLECTIONS } from '@/lib/firebase';
import { usePuja } from '@/contexts/PujaContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import SummaryCard from '@/components/SummaryCard';

export default function Pujas() {
  const { members, setMembers } = useStore();
  const { pujas, createPuja, updatePuja, deletePuja, switchPuja } = usePuja();
  const { isSuperAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPuja, setEditingPuja] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    description: '',
    managerId: '',
    status: 'pending'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(COLLECTIONS.MEMBERS, (data) => {
      setMembers(data || []);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [setMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const manager = members.find(m => m.id === formData.managerId);
      const pujaData = {
        ...formData,
        // Only set dates if provided
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
        managerName: manager?.name || ''
      };

      // Only super admin can set status to completed
      if (!isSuperAdmin() && pujaData.status === 'completed') {
        pujaData.status = 'active';
      }

      if (editingPuja) {
        await updatePuja(editingPuja.id, pujaData);
        toast.success('Puja updated successfully');
      } else {
        await createPuja(pujaData);
        toast.success('Puja created successfully');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving puja:', error);
      toast.error('Failed to save puja');
    }
  };

  const handleEdit = (puja) => {
    setEditingPuja(puja);
    setFormData({
      name: puja.name || '',
      year: puja.year || new Date().getFullYear(),
      startDate: puja.startDate ? new Date(puja.startDate).toISOString().split('T')[0] : '',
      endDate: puja.endDate ? new Date(puja.endDate).toISOString().split('T')[0] : '',
      description: puja.description || '',
      managerId: puja.managerId || '',
      status: puja.status || 'pending'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (pujaId) => {
    if (window.confirm('Are you sure you want to delete this puja? This will also delete all associated data.')) {
      try {
        await deletePuja(pujaId);
        toast.success('Puja deleted successfully');
      } catch (error) {
        console.error('Error deleting puja:', error);
        toast.error('Failed to delete puja');
      }
    }
  };

  const handleSwitchPuja = (puja) => {
    switchPuja(puja);
    toast.success(`Switched to ${puja.name}`);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      year: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      description: '',
      managerId: '',
      status: 'pending'
    });
    setEditingPuja(null);
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'completed': return 'bg-gray-100 text-gray-600';
      case 'pending': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading pujas..." />;
  }

  if (!isSuperAdmin()) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">Only Super Admin can manage pujas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Puja Management"
        description="Create and manage pujas, assign managers"
        buttonText="Create Puja"
        onButtonClick={() => setIsModalOpen(true)}
        buttonIcon={Plus}
      />

      {/* Summary Card */}
      <SummaryCard
        items={[
          {
            icon: Calendar,
            label: 'Total Pujas',
            value: pujas.length.toString(),
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            icon: Calendar,
            label: 'Active Pujas',
            value: pujas.filter(p => p.status === 'active').length.toString(),
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          }
        ]}
      />

      {/* Pujas List */}
      <div className="space-y-4">
        {pujas.map((puja) => {
          const manager = members.find(m => m.id === puja.managerId);
          return (
            <div key={puja.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{puja.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{puja.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-2 sm:space-y-0">
                      <span className="text-xs text-gray-600">
                        {puja.year}
                      </span>
                      {puja.startDate && puja.endDate && (
                        <span className="text-xs text-gray-600">
                          {new Date(puja.startDate).toLocaleDateString()} - {new Date(puja.endDate).toLocaleDateString()}
                        </span>
                      )}
                      {manager && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block w-fit">
                          Manager: {manager.name}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded flex items-center space-x-1 w-fit ${getStatusColor(puja.status)}`}>
                        {getStatusIcon(puja.status)}
                        <span>{puja.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1 sm:ml-2">
                  <button
                    onClick={() => handleSwitchPuja(puja)}
                    className="flex-1 sm:flex-none p-2 sm:p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors flex items-center justify-center sm:justify-start"
                    title="Switch to this puja"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="ml-2 sm:hidden text-sm">Switch</span>
                  </button>
                  <button
                    onClick={() => handleEdit(puja)}
                    className="flex-1 sm:flex-none p-2 sm:p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center sm:justify-start"
                    title="Edit puja"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="ml-2 sm:hidden text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(puja.id)}
                    className="flex-1 sm:flex-none p-2 sm:p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center sm:justify-start"
                    title="Delete puja"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-2 sm:hidden text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pujas.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pujas created</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first puja.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPuja ? 'Edit Puja' : 'Create New Puja'}
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
                  Puja Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter puja name (e.g., Kali Puja 2025)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  required
                  min="2020"
                  max="2030"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="input-field"
                  placeholder="Enter year"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
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
                  placeholder="Enter puja description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select manager (optional)</option>
                  {members.filter(member => ['admin', 'manager'].includes(member.role?.toLowerCase())).map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed" disabled={!isSuperAdmin()}>Completed</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingPuja ? 'Update' : 'Create'} Puja
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
