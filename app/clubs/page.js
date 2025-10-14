'use client';

import { useEffect, useState } from 'react';
import useStore from '@/store/useStore';
import PageHeader from '@/components/PageHeader';
import { COLLECTIONS, addDocument, subscribeToCollection, updateDocument, deleteDocument } from '@/lib/firebase';
import { demoList } from '@/lib/demoData';
import { Users, Plus } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

export default function ClubsPage() {
  const router = useRouter();
  const { clubs, setClubs, isPlatformAdmin, setCurrentClubId } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.CLUBS, setClubs);
    return () => unsub();
  }, [setClubs]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
      setClubs(demoList(COLLECTIONS.CLUBS));
    }
  }, [setClubs]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isPlatformAdmin()) {
      toast.error('Only platform admin can create clubs');
      return;
    }
    try {
      const id = await addDocument(COLLECTIONS.CLUBS, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      toast.success('Club created');
      // navigate to club dashboard
      if (id) router.push(`/clubs/${id}`);
    } catch (e2) {
      toast.error(`Failed to create club: ${e2?.message || 'Unknown error'}`);
    }
  };

  const onEdit = (club) => {
    setEditingId(club.id);
    setEditForm({ name: club.name || '', email: club.email || '', password: club.password || '' });
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDocument(COLLECTIONS.CLUBS, editingId, { name: editForm.name, email: editForm.email, password: editForm.password });
      setEditingId(null);
      toast.success('Club updated');
    } catch (e2) {
      toast.error(`Failed to update club: ${e2?.message || 'Unknown error'}`);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this club?')) return;
    try {
      await deleteDocument(COLLECTIONS.CLUBS, id);
      toast.success('Club deleted');
    } catch (e2) {
      toast.error(`Failed to delete club: ${e2?.message || 'Unknown error'}`);
    }
  };

  const onManage = (id) => {
    setCurrentClubId(id);
    router.push(`/clubs/${id}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Clubs" description="Create and view clubs" buttonText="Add Club" onButtonClick={() => setShowForm(true)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showForm && (
          <div className="modal">
            <div className="modal-content">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Add Club</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowForm(false)} aria-label="Close">✕</button>
              </div>
              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                  <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="btn-primary" type="submit">Create</button>
                  <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clubs.map((club) => (
                  <tr key={club.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 text-blue-700"><Users className="w-4 h-4" /></span>
                      <span className="font-medium">{club.name}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{club.email || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center justify-end gap-2">
                        <button className="btn-secondary mobile-full" onClick={() => onEdit(club)}>Edit</button>
                        <button className="btn-danger mobile-full" onClick={() => onDelete(club.id)}>Delete</button>
                        <button className="btn-primary mobile-full" onClick={() => onManage(club.id)}>Manage</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editingId && (
          <div className="modal">
            <div className="modal-content">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Edit Club</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setEditingId(null)} aria-label="Close">✕</button>
              </div>
              <form onSubmit={onUpdate} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                  <input className="input-field" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="input-field" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="text" className="input-field" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="btn-primary" type="submit">Save</button>
                  <button className="btn-secondary" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


