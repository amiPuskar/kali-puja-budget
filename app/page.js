'use client';

import { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, CheckSquare, Package, Calendar, Gift, Trophy } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection, ensureDefaultClub } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase';
import PageHeader from '@/components/PageHeader';

export default function Dashboard() {
  const { 
    members, 
    expenses, 
    tasks, 
    inventory, 
    sponsors, 
    events,
    participants,
    prizes,
    clubs,
    pujas,
    currentClubId,
    currentYear,
    setMembers, 
    setExpenses, 
    setTasks, 
    setInventory, 
    setSponsors,
    setEvents,
    setParticipants,
    setPrizes,
    setClubs,
    setPujas,
    setCurrentClubId,
    setCurrentYear,
    getTotalCollected,
    getTotalSpent,
    getRemainingBalance,
    getUpcomingTasks,
    getPendingItems,
    getTotalDonations,
    getFilteredMembers,
    getFilteredExpenses,
    getFilteredEvents,
    getFilteredParticipants,
    isPlatformAdmin,
    isClubAdmin
  } = useStore();

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribeMembers = subscribeToCollection(COLLECTIONS.MEMBERS, setMembers);
    const unsubscribeExpenses = subscribeToCollection(COLLECTIONS.EXPENSES, setExpenses);
    const unsubscribeTasks = subscribeToCollection(COLLECTIONS.TASKS, setTasks);
    const unsubscribeInventory = subscribeToCollection(COLLECTIONS.INVENTORY, setInventory);
    const unsubscribeSponsors = subscribeToCollection(COLLECTIONS.SPONSORS, setSponsors);
    const unsubscribeEvents = subscribeToCollection(COLLECTIONS.EVENTS, setEvents);
    const unsubscribeParticipants = subscribeToCollection(COLLECTIONS.PARTICIPANTS, setParticipants);
    const unsubscribePrizes = subscribeToCollection(COLLECTIONS.PRIZES, setPrizes);
    const unsubscribeClubs = subscribeToCollection(COLLECTIONS.CLUBS, setClubs);
    const unsubscribePujas = subscribeToCollection(COLLECTIONS.PUJAS, setPujas);

    return () => {
      unsubscribeMembers();
      unsubscribeExpenses();
      unsubscribeTasks();
      unsubscribeInventory();
      unsubscribeSponsors();
      unsubscribeEvents();
      unsubscribeParticipants();
      unsubscribePrizes();
      unsubscribeClubs();
      unsubscribePujas();
    };
  }, [setMembers, setExpenses, setTasks, setInventory, setSponsors, setEvents, setParticipants, setPrizes, setClubs, setPujas]);

  useEffect(() => {
    // Seed a default club in dev if none exists (best-effort)
    ensureDefaultClub();
  }, []);

  const totalCollected = getTotalCollected();
  const totalSpent = getTotalSpent();
  const remainingBalance = getRemainingBalance();
  const upcomingTasks = getUpcomingTasks();
  const pendingItems = getPendingItems();
  const totalDonations = getTotalDonations();

  const filteredMembers = getFilteredMembers();
  const filteredExpenses = getFilteredExpenses();
  const filteredEvents = getFilteredEvents();
  const filteredParticipants = getFilteredParticipants();

  const availableYears = useMemo(() => {
    const fromPujas = pujas
      .filter((p) => !currentClubId || p.clubId === currentClubId)
      .map((p) => p.year)
      .filter((y) => typeof y === 'number');
    const unique = Array.from(new Set(fromPujas));
    if (unique.length > 0) return unique.sort((a, b) => b - a);
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2];
  }, [pujas, currentClubId]);

  const stats = [
    {
      name: 'Total Collected',
      value: `₹${totalCollected.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Spent',
      value: `₹${totalSpent.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'Remaining Balance',
      value: `₹${remainingBalance.toLocaleString()}`,
      icon: TrendingUp,
      color: remainingBalance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: remainingBalance >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      name: 'Total Members',
      value: filteredMembers.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Cultural Events',
      value: filteredEvents.length.toString(),
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      name: 'Total Donations',
      value: `₹${totalDonations.toLocaleString()}`,
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Prizes',
      value: prizes.length.toString(),
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {isPlatformAdmin() ? (
        <AdminClubsView />
      ) : (
        <>
          {/* Club / Year selectors */}
          <div className="card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isClubAdmin() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                  <select
                    className="input-field"
                    value={currentClubId || ''}
                    onChange={(e) => setCurrentClubId(e.target.value || null)}
                  >
                    <option value="">All Clubs</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  className="input-field"
                  value={currentYear || ''}
                  onChange={(e) => setCurrentYear(Number(e.target.value) || null)}
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <PageHeader
            title="Dashboard"
            description="Overview of your Puja budget and expenses"
            showButton={false}
          />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor} mr-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                  <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {/* Recent Members */}
        <div className="card">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Recent Members</h3>
          {filteredMembers.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm">No members added yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.role}</p>
                  </div>
                  <span className="text-xs font-medium text-green-600 ml-2 flex-shrink-0">
                    ₹{member.contribution?.toLocaleString() || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Recent Expenses</h3>
          {filteredExpenses.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm">No expenses recorded yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{expense.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-red-600 ml-2 flex-shrink-0">
                    ₹{expense.amount?.toLocaleString() || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Upcoming Tasks</h3>
          {upcomingTasks.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm">No upcoming tasks</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-1 sm:px-2 py-1 rounded ml-2 flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-red-100 text-red-600' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Items */}
        <div className="card">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Pending Items</h3>
          {pendingItems.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm">All items received</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {pendingItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.category}</p>
                  </div>
                  <span className="text-xs text-orange-600 bg-orange-100 px-1 sm:px-2 py-1 rounded ml-2 flex-shrink-0">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="card">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Recent Events</h3>
          {filteredEvents.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm">No events scheduled yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{event.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(event.date).toLocaleDateString()} • {event.category}
                    </p>
                  </div>
                  <span className="text-xs text-pink-600 bg-pink-100 px-1 sm:px-2 py-1 rounded ml-2 flex-shrink-0">
                    {filteredParticipants.filter(p => p.eventId === event.id).length} participants
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

function AdminClubsView() {
  const { clubs, setClubs, setCurrentClubId } = useStore();
  const [form, setForm] = useState({ name: '', president: '', vicePresident: '', secretary: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', president: '', vicePresident: '', secretary: '' });
  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.CLUBS, setClubs);
    return () => unsub();
  }, [setClubs]);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      await addDocument(COLLECTIONS.CLUBS, {
        name: form.name,
        roles: { president: form.president, vicePresident: form.vicePresident, secretary: form.secretary },
      });
      setForm({ name: '', president: '', vicePresident: '', secretary: '' });
    } catch {}
  };
  const onEdit = (club) => {
    setEditingId(club.id);
    setEditForm({ name: club.name || '', president: club.roles?.president || '', vicePresident: club.roles?.vicePresident || '', secretary: club.roles?.secretary || '' });
  };
  const onUpdate = async (e, id) => {
    e.preventDefault();
    try {
      await updateDocument(COLLECTIONS.CLUBS, id, { name: editForm.name, roles: { president: editForm.president, vicePresident: editForm.vicePresident, secretary: editForm.secretary } });
      setEditingId(null);
    } catch {}
  };
  const onDelete = async (id) => {
    try { await deleteDocument(COLLECTIONS.CLUBS, id); } catch {}
  };
  const onManage = (clubId) => {
    setCurrentClubId(clubId);
    // navigate to pujas
    if (typeof window !== 'undefined') window.location.href = '/pujas';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Platform Admin" description="Manage clubs" showButton={false} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Create Club</h3>
          <form onSubmit={onCreate} className="space-y-3">
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
            <div key={club.id} className="card space-y-3">
              {editingId === club.id ? (
                <form onSubmit={(e) => onUpdate(e, club.id)} className="space-y-3">
                  <input className="input-field" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input className="input-field" value={editForm.president} onChange={(e) => setEditForm({ ...editForm, president: e.target.value })} />
                    <input className="input-field" value={editForm.vicePresident} onChange={(e) => setEditForm({ ...editForm, vicePresident: e.target.value })} />
                    <input className="input-field" value={editForm.secretary} onChange={(e) => setEditForm({ ...editForm, secretary: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary" type="submit">Save</button>
                    <button className="btn-secondary" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{club.name}</div>
                    <div className="text-xs text-gray-600">President: {club.roles?.president || '-'} • VP: {club.roles?.vicePresident || '-'} • Secretary: {club.roles?.secretary || '-'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => onEdit(club)}>Edit</button>
                    <button className="btn-danger" onClick={() => onDelete(club.id)}>Delete</button>
                    <button className="btn-primary" onClick={() => onManage(club.id)}>Manage</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
