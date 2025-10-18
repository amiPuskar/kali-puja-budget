'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { PujaProvider } from '@/contexts/PujaContext';
import LayoutWrapper from '@/components/LayoutWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DollarSign, TrendingUp, TrendingDown, Users, CheckSquare, Package, Calendar, Gift, Trophy, UserCheck, Receipt, Target, Coins } from 'lucide-react';
import useStore from '@/store/useStore';
import { subscribeToCollection } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase';
import { usePuja } from '@/contexts/PujaContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

function DashboardContent() {
  const { 
    members, 
    contributions,
    expenses, 
    tasks, 
    inventory, 
    sponsors, 
    events, 
    participants, 
    prizes,
    budgetAllocations,
    paraCollections,
    setMembers, 
    setContributions,
    setExpenses, 
    setTasks, 
    setInventory, 
    setSponsors, 
    setEvents, 
    setParticipants, 
    setPrizes,
    setBudgetAllocations,
    setParaCollections,
    getTotalCollected, 
    getTotalSpent, 
    getRemainingBalance, 
    getUpcomingTasks, 
    getPendingItems, 
    getTotalDonations,
    getTotalAllocatedForPuja,
    getTotalParaCollections
  } = useStore();

  const { currentPuja } = usePuja();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Subscribe to club members (not puja-specific)
    const unsubscribeMembers = subscribeToCollection(COLLECTIONS.MEMBERS, setMembers);
    
    if (!currentPuja) {
      return () => {
        unsubscribeMembers();
      };
    }

    // Subscribe to puja-specific data
    const unsubscribeContributions = subscribeToCollection(`${COLLECTIONS.CONTRIBUTIONS}_${currentPuja.id}`, setContributions);
    const unsubscribeExpenses = subscribeToCollection(`${COLLECTIONS.EXPENSES}_${currentPuja.id}`, setExpenses);
    const unsubscribeTasks = subscribeToCollection(`${COLLECTIONS.TASKS}_${currentPuja.id}`, setTasks);
    const unsubscribeInventory = subscribeToCollection(`${COLLECTIONS.INVENTORY}_${currentPuja.id}`, setInventory);
    const unsubscribeSponsors = subscribeToCollection(`${COLLECTIONS.SPONSORS}_${currentPuja.id}`, setSponsors);
    const unsubscribeEvents = subscribeToCollection(`${COLLECTIONS.EVENTS}_${currentPuja.id}`, setEvents);
    const unsubscribeParticipants = subscribeToCollection(`${COLLECTIONS.PARTICIPANTS}_${currentPuja.id}`, setParticipants);
    const unsubscribePrizes = subscribeToCollection(`${COLLECTIONS.PRIZES}_${currentPuja.id}`, setPrizes);
    const unsubscribeBudgetAllocations = subscribeToCollection(`${COLLECTIONS.BUDGET_ALLOCATIONS}_${currentPuja.id}`, setBudgetAllocations);
    const unsubscribeParaCollections = subscribeToCollection(`${COLLECTIONS.PARA_COLLECTIONS}_${currentPuja.id}`, setParaCollections);

    return () => {
      unsubscribeMembers();
      unsubscribeContributions();
      unsubscribeExpenses();
      unsubscribeTasks();
      unsubscribeInventory();
      unsubscribeSponsors();
      unsubscribeEvents();
      unsubscribeParticipants();
      unsubscribePrizes();
      unsubscribeBudgetAllocations();
      unsubscribeParaCollections();
    };
  }, [currentPuja, setMembers, setContributions, setExpenses, setTasks, setInventory, setSponsors, setEvents, setParticipants, setPrizes, setBudgetAllocations, setParaCollections]);

  const totalCollected = getTotalCollected();
  const totalSpent = getTotalSpent();
  const remainingBalance = getRemainingBalance();
  const upcomingTasks = getUpcomingTasks();
  const pendingItems = getPendingItems();
  const totalDonations = getTotalDonations();
  const totalParaCollected = getTotalParaCollections();
  const totalParaCollections = paraCollections.length;

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
      name: 'Para Collections',
      value: `₹${totalParaCollected.toLocaleString()}`,
      icon: Coins,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
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
      name: 'Total Donations',
      value: totalDonations.toLocaleString(),
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            {currentPuja ? `${currentPuja.name} - Overview` : 'Overview of your Puja budget and expenses'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card hover:shadow-md transition-shadow">
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

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Expenses Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Expenses</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Budget</span>
              <span className="text-sm font-medium text-gray-900">₹{totalCollected.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Spent</span>
              <span className="text-sm font-medium text-gray-900">₹{totalSpent.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${totalCollected > 0 ? (totalSpent / totalCollected) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium text-gray-900">Remaining</span>
              <span className={`text-sm font-semibold ${remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {isAdmin() ? (
              <>
                <Link href="/contributions" className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <UserCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900 text-center">Add Contribution</p>
                </Link>
                <Link href="/expenses" className="p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <Receipt className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-red-900 text-center">Add Expense</p>
                </Link>
                <Link href="/budget" className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900 text-center">Budget Allocation</p>
                </Link>
                <Link href="/events" className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-900 text-center">Add Event</p>
                </Link>
                <Link href="/para-collection" className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <Coins className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-orange-900 text-center">Para Collection</p>
                </Link>
              </>
            ) : (
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <Link href="/contributions" className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <UserCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900 text-center">My Contributions</p>
                </Link>
                <Link href="/para-collection" className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <Coins className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-orange-900 text-center">Para Collection</p>
                </Link>
                <Link href="/events" className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-900 text-center">View Events</p>
                </Link>
                <Link href="/members" className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900 text-center">Club Members</p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Contributions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Contributions</h3>
            {isAdmin() && (
              <Link href="/contributions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            )}
          </div>
          {contributions.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No contributions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributions.slice(0, 5).map((contribution) => {
                const member = members.find(m => m.id === contribution.memberId);
                return (
                  <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member?.name || 'Unknown Member'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(contribution.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      ₹{contribution.amount?.toLocaleString() || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
            {isAdmin() && (
              <Link href="/expenses" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            )}
          </div>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No expenses recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    ₹{expense.amount?.toLocaleString() || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
            {isAdmin() && (
              <Link href="/tasks" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            )}
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No upcoming tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <CheckSquare className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
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

        {/* Recent Para Collections */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Para Collections</h3>
            {isAdmin() && (
              <Link href="/para-collection" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            )}
          </div>
          {paraCollections.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No para collections yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paraCollections.slice(0, 5).map((collection) => (
                <div key={collection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Coins className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{collection.collectedBy || 'Not specified'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(collection.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    ₹{collection.amount?.toLocaleString() || 0}
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

export default function HomePage() {
  return (
    <AuthProvider>
      <PujaProvider>
        <LayoutWrapper>
          <ProtectedRoute>
            <DashboardContent />
          </ProtectedRoute>
        </LayoutWrapper>
      </PujaProvider>
    </AuthProvider>
  );
}