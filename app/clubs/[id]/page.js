'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import PageHeader from '@/components/PageHeader';
import { COLLECTIONS, subscribeToCollection } from '@/lib/firebase';

export default function ClubManagePage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params?.id;
  const { clubs, setClubs, setCurrentClubId, pujas, setPujas, members, setMembers, expenses, setExpenses, tasks, setTasks } = useStore();

  useEffect(() => {
    setCurrentClubId(clubId);
  }, [clubId, setCurrentClubId]);

  useEffect(() => {
    const unsubClubs = subscribeToCollection(COLLECTIONS.CLUBS, setClubs);
    const unsubPujas = subscribeToCollection(COLLECTIONS.PUJAS, setPujas);
    const unsubMembers = subscribeToCollection(COLLECTIONS.MEMBERS, setMembers);
    const unsubExpenses = subscribeToCollection(COLLECTIONS.EXPENSES, setExpenses);
    const unsubTasks = subscribeToCollection(COLLECTIONS.TASKS, setTasks);
    return () => { unsubClubs(); unsubPujas(); unsubMembers(); unsubExpenses(); unsubTasks(); };
  }, [setClubs, setPujas, setMembers, setExpenses, setTasks]);

  const club = useMemo(() => clubs.find(c => c.id === clubId), [clubs, clubId]);
  const clubPujas = pujas.filter(p => p.clubId === clubId);
  const clubMembers = members.filter(m => m.clubId === clubId);
  const clubExpenses = expenses.filter(e => e.clubId === clubId);
  const clubTasks = tasks.filter(t => t.clubId === clubId);
  const totalSpent = clubExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <button className="btn-secondary" onClick={() => router.push('/clubs')}>Back</button>
      </div>
      <PageHeader title={club ? `Manage: ${club.name}` : 'Manage Club'} description="Add puja, manage members, and view summary" showButton={false} />

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button className="btn-primary" onClick={() => router.push('/pujas')}>Add Puja</button>
        <button className="btn-secondary" onClick={() => router.push('/members')}>Manage Members</button>
        <button className="btn-secondary" onClick={() => router.push('/')}>View Dashboard</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-600">Total Pujas</div>
          <div className="text-2xl font-semibold text-gray-900">{clubPujas.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Members</div>
          <div className="text-2xl font-semibold text-gray-900">{clubMembers.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Tasks</div>
          <div className="text-2xl font-semibold text-gray-900">{clubTasks.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Total Spent</div>
          <div className="text-2xl font-semibold text-gray-900">₹{totalSpent.toLocaleString()}</div>
        </div>
      </div>

      {/* Puja list */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puja</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clubPujas.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{p.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


