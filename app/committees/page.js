'use client';

import { useEffect, useState } from 'react';
import useStore from '@/store/useStore';
import PageHeader from '@/components/PageHeader';
import { COLLECTIONS, addDocument, subscribeToCollection } from '@/lib/firebase';
import { Users, Plus } from 'lucide-react';
import { toast } from '@/lib/toast';

export default function ClubsPage() {
  const { clubs, setClubs, isPlatformAdmin } = useStore();
  const [form, setForm] = useState({ name: '', president: '', vicePresident: '', secretary: '' });

  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.CLUBS, setClubs);
    return () => unsub();
  }, [setClubs]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isPlatformAdmin()) {
      toast.error('Only platform admin can create clubs');
      return;
    }
    try {
      await addDocument(COLLECTIONS.CLUBS, {
        name: form.name,
        roles: {
          president: form.president,
          vicePresident: form.vicePresident,
          secretary: form.secretary,
        },
      });
      setForm({ name: '', president: '', vicePresident: '', secretary: '' });
      toast.success('Club created');
    } catch (e2) {
      toast.error('Failed to create club');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Clubs" description="Create and view clubs" buttonText="Create Club" onButtonClick={() => {}} buttonIcon={Plus} showButton={false} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Create Club</h3>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">President</label>
                <input className="input-field" value={form.president} onChange={(e) => setForm({ ...form, president: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vice President</label>
                <input className="input-field" value={form.vicePresident} onChange={(e) => setForm({ ...form, vicePresident: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secretary</label>
                <input className="input-field" value={form.secretary} onChange={(e) => setForm({ ...form, secretary: e.target.value })} />
              </div>
            </div>
            <button className="btn-primary" type="submit">Create Club</button>
          </form>
        </div>
        <div className="space-y-3">
          {clubs.map((club) => (
            <div key={club.id} className="card flex items-center gap-3">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{club.name}</div>
                <div className="text-xs text-gray-600">President: {club.roles?.president || '-'} • VP: {club.roles?.vicePresident || '-'} • Secretary: {club.roles?.secretary || '-'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


