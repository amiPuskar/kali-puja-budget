'use client';

import { useEffect, useState } from 'react';
import useStore from '@/store/useStore';
import PageHeader from '@/components/PageHeader';
import { COLLECTIONS, addDocument, subscribeToCollection } from '@/lib/firebase';
import { Target } from 'lucide-react';
import { toast } from '@/lib/toast';

export default function PujasPage() {
  const { clubs, pujas, setClubs, setPujas, currentClubId, setCurrentClubId, currentYear, setCurrentYear, isClubAdmin, isPlatformAdmin } = useStore();
  const [form, setForm] = useState({ name: '', year: new Date().getFullYear(), clubId: '' });

  useEffect(() => {
    const unsubClubs = subscribeToCollection(COLLECTIONS.CLUBS, setClubs);
    const unsubPujas = subscribeToCollection(COLLECTIONS.PUJAS, setPujas);
    return () => { unsubClubs(); unsubPujas(); };
  }, [setClubs, setPujas]);

  useEffect(() => {
    // For club admins, force clubId to currentClubId in form and filters
    if (isClubAdmin() && currentClubId) {
      setForm((f) => ({ ...f, clubId: currentClubId }));
    }
  }, [isClubAdmin, currentClubId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.clubId) { toast.error('Select a club'); return; }
      await addDocument(COLLECTIONS.PUJAS, {
        name: form.name,
        year: Number(form.year),
        clubId: form.clubId,
      });
      if (!currentClubId) setCurrentClubId(form.clubId);
      setCurrentYear(Number(form.year));
      setForm({ name: '', year: new Date().getFullYear(), clubId: '' });
      toast.success('Puja created');
    } catch (e2) {
      toast.error('Failed to create puja');
    }
  };

  const filtered = pujas.filter(p => (!currentClubId || p.clubId === currentClubId));

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Pujas" description="Create pujas per club and year" showButton={false} />

      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!isClubAdmin() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
              <select className="input-field" value={currentClubId || ''} onChange={(e) => setCurrentClubId(e.target.value || null)}>
                <option value="">Select club</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input className="input-field" type="number" value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))} />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">Selected filters apply across dashboard.</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Create Puja</h3>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kali Puja" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input type="number" className="input-field" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required />
              </div>
              {!isClubAdmin() ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                  <select className="input-field" value={form.clubId} onChange={(e) => setForm({ ...form, clubId: e.target.value })} required>
                    <option value="">Select club</option>
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              ) : null}
            </div>
            <button className="btn-primary" type="submit">Create Puja</button>
          </form>
        </div>
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="card flex items-center gap-3">
              <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg"><Target className="w-5 h-5 text-yellow-600" /></div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{p.name} • {p.year}</div>
                <div className="text-xs text-gray-600">Club: {clubs.find(c => c.id === p.clubId)?.name || p.clubId}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


