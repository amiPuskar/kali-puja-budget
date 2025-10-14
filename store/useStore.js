import { create } from 'zustand';

const useStore = create((set, get) => ({
  // State
  members: [],
  expenses: [],
  volunteers: [],
  tasks: [],
  inventory: [],
  sponsors: [],
  budget: [],
  events: [],
  participants: [],
  prizes: [],
  loading: false,
  error: null,

  // Actions
  setMembers: (members) => set({ members }),
  setExpenses: (expenses) => set({ expenses }),
  setVolunteers: (volunteers) => set({ volunteers }),
  setTasks: (tasks) => set({ tasks }),
  setInventory: (inventory) => set({ inventory }),
  setSponsors: (sponsors) => set({ sponsors }),
  setBudget: (budget) => set({ budget }),
  setEvents: (events) => set({ events }),
  setParticipants: (participants) => set({ participants }),
  setPrizes: (prizes) => set({ prizes }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Computed values
  getTotalCollected: () => {
    const members = get().members;
    return members.reduce((total, member) => total + (member.contribution || 0), 0);
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

  getTotalBudget: () => {
    const budget = get().budget;
    return budget.reduce((total, item) => total + (item.allocatedAmount || 0), 0);
  },

  getBudgetCategories: () => {
    const budget = get().budget;
    return budget.map(item => item.name);
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
    expenses: [],
    volunteers: [],
    tasks: [],
    inventory: [],
    sponsors: [],
    budget: [],
    events: [],
    participants: [],
    prizes: [],
    loading: false,
    error: null
  })
}));

export default useStore;
