import { create } from 'zustand';

const useStore = create((set, get) => ({
  // State
  members: [], // Club members (not puja-specific)
  pendingMembers: [], // Pending member registrations
  contributions: [], // Member contributions per puja
  paraCollections: [], // Para collections per puja
  expenses: [],
  volunteers: [],
  tasks: [],
  inventory: [],
  sponsors: [],
  budgetItems: [], // Default budget items (not puja-specific)
  budgetAllocations: [], // Puja-specific budget allocations
  events: [],
  participants: [],
  prizes: [],
  loading: false,
  error: null,

  // Actions
  setMembers: (members) => set({ members }),
  setPendingMembers: (pendingMembers) => set({ pendingMembers }),
  setContributions: (contributions) => set({ contributions }),
  setParaCollections: (paraCollections) => set({ paraCollections }),
  setExpenses: (expenses) => set({ expenses }),
  setVolunteers: (volunteers) => set({ volunteers }),
  setTasks: (tasks) => set({ tasks }),
  setInventory: (inventory) => set({ inventory }),
  setSponsors: (sponsors) => set({ sponsors }),
  setBudgetItems: (budgetItems) => set({ budgetItems }),
  setBudgetAllocations: (budgetAllocations) => set({ budgetAllocations }),
  setEvents: (events) => set({ events }),
  setParticipants: (participants) => set({ participants }),
  setPrizes: (prizes) => set({ prizes }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Computed values
  getTotalCollected: () => {
    const contributions = get().contributions;
    const paraCollections = get().paraCollections;
    const contributionsTotal = contributions.reduce((total, contribution) => total + (contribution.amount || 0), 0);
    const paraCollectionsTotal = paraCollections.reduce((total, collection) => total + (collection.amount || 0), 0);
    return contributionsTotal + paraCollectionsTotal;
  },

  getTotalSpent: () => {
    const expenses = get().expenses;
    return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
  },

  getRemainingBalance: () => {
    const totalCollected = get().getTotalCollected();
    const totalSpent = get().getTotalSpent();
    return totalCollected - totalSpent;
  },

  // New computed values
  getUpcomingTasks: () => {
    const tasks = get().tasks;
    const today = new Date();
    return tasks.filter(task => 
      !task.completed && 
      new Date(task.dueDate) > today
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  },

  getPendingItems: () => {
    const inventory = get().inventory;
    return inventory.filter(item => !item.received);
  },

  getCompletedTasks: () => {
    const tasks = get().tasks;
    return tasks.filter(task => task.completed);
  },

  getTotalDonations: () => {
    const sponsors = get().sponsors;
    return sponsors.reduce((total, sponsor) => total + (sponsor.amount || 0), 0);
  },

  getTotalParaCollections: () => {
    const paraCollections = get().paraCollections;
    return paraCollections.reduce((total, collection) => total + (collection.amount || 0), 0);
  },

  getTotalBudget: () => {
    const budgetAllocations = get().budgetAllocations;
    return budgetAllocations.reduce((total, allocation) => total + (allocation.allocatedAmount || 0), 0);
  },

  getBudgetCategories: () => {
    const budgetItems = get().budgetItems;
    return budgetItems.map(item => item.name);
  },

  // New budget helper functions
  getBudgetItems: () => {
    return get().budgetItems;
  },

  getBudgetAllocationsForPuja: (pujaId) => {
    const budgetAllocations = get().budgetAllocations;
    return budgetAllocations.filter(allocation => allocation.pujaId === pujaId);
  },

  getBudgetItemAllocation: (budgetItemId, pujaId) => {
    const budgetAllocations = get().budgetAllocations;
    return budgetAllocations.find(allocation => 
      allocation.budgetItemId === budgetItemId && allocation.pujaId === pujaId
    );
  },

  getTotalAllocatedForPuja: (pujaId) => {
    const budgetAllocations = get().budgetAllocations;
    return budgetAllocations
      .filter(allocation => allocation.pujaId === pujaId)
      .reduce((total, allocation) => total + (allocation.allocatedAmount || 0), 0);
  },

  // New helper functions for contributions
  getContributionsByMember: (memberId) => {
    const contributions = get().contributions;
    return contributions.filter(contribution => contribution.memberId === memberId);
  },

  getMemberContributionForPuja: (memberId, pujaId) => {
    const contributions = get().contributions;
    return contributions.find(contribution => 
      contribution.memberId === memberId && contribution.pujaId === pujaId
    );
  },

  getTotalContributionByMember: (memberId) => {
    const contributions = get().contributions;
    return contributions
      .filter(contribution => contribution.memberId === memberId)
      .reduce((total, contribution) => total + (contribution.amount || 0), 0);
  },

  getEventsWithDetails: () => {
    const { events, participants, prizes, members } = get();
    return events.map(event => {
      const eventParticipants = participants.filter(p => p.eventId === event.id);
      const eventPrizes = prizes.filter(p => p.eventId === event.id);
      const responsibleMember = members.find(m => m.id === event.responsibleMemberId);
      
      return {
        ...event,
        participants: eventParticipants,
        prizes: eventPrizes,
        responsibleMember: responsibleMember
      };
    });
  },

  getParticipantsByEvent: (eventId) => {
    const participants = get().participants;
    return participants.filter(p => p.eventId === eventId);
  },

  getPrizesByEvent: (eventId) => {
    const prizes = get().prizes;
    return prizes.filter(p => p.eventId === eventId);
  },

  // Clear all data
  clearAll: () => set({
    members: [],
    pendingMembers: [],
    contributions: [],
    paraCollections: [],
    expenses: [],
    volunteers: [],
    tasks: [],
    inventory: [],
    sponsors: [],
    budgetItems: [],
    budgetAllocations: [],
    events: [],
    participants: [],
    prizes: [],
    loading: false,
    error: null
  })
}));

export default useStore;
