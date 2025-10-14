'use client';

import { useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, CheckSquare, Package, Calendar, Gift, Trophy } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection } from '@/lib/firebase';
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
    setMembers, 
    setExpenses, 
    setTasks, 
    setInventory, 
    setSponsors,
    setEvents,
    setParticipants,
    setPrizes,
    getTotalCollected,
    getTotalSpent,
    getRemainingBalance,
    getUpcomingTasks,
    getPendingItems,
    getTotalDonations
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

    return () => {
      unsubscribeMembers();
      unsubscribeExpenses();
      unsubscribeTasks();
      unsubscribeInventory();
      unsubscribeSponsors();
      unsubscribeEvents();
      unsubscribeParticipants();
      unsubscribePrizes();
    };
  }, [setMembers, setExpenses, setTasks, setInventory, setSponsors, setEvents, setParticipants, setPrizes]);

  const totalCollected = getTotalCollected();
  const totalSpent = getTotalSpent();
  const remainingBalance = getRemainingBalance();
  const upcomingTasks = getUpcomingTasks();
  const pendingItems = getPendingItems();
  const totalDonations = getTotalDonations();

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
      value: members.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Cultural Events',
      value: events.length.toString(),
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
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
      <PageHeader
        title="Dashboard"
        description="Overview of your Puja budget and expenses"
        showButton={false}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                  <p className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {/* Recent Members */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Recent Members</h3>
          {members.length === 0 ? (
            <p className="text-gray-500 text-sm">No members added yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {members.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.role}</p>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-green-600 ml-2">
                    ₹{member.contribution?.toLocaleString() || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Recent Expenses</h3>
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-sm">No expenses recorded yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-red-600 ml-2">
                    ₹{expense.amount?.toLocaleString() || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Upcoming Tasks</h3>
          {upcomingTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming tasks</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ml-2 ${
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
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Pending Items</h3>
          {pendingItems.length === 0 ? (
            <p className="text-gray-500 text-sm">All items received</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {pendingItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.category}</p>
                  </div>
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded ml-2">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Recent Events</h3>
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">No events scheduled yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(event.date).toLocaleDateString()} • {event.category}
                    </p>
                  </div>
                  <span className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded ml-2">
                    {participants.filter(p => p.eventId === event.id).length} participants
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
