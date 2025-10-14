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
  clubs: [],
  pujas: [],
  contributions: [],
  currentClubId: null,
  currentPujaId: null,
  currentYear: new Date().getFullYear(),
  user: null, // { id, name, role: 'platform_admin' | 'club_admin' | 'member', clubId? }
  hydrated: false,
  sidebarOpen: false,
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
  setClubs: (clubs) => set({ clubs }),
  setPujas: (pujas) => set({ pujas }),
  setContributions: (contributions) => set({ contributions }),
  setCurrentClubId: (currentClubId) => set({ currentClubId }),
  setCurrentPujaId: (currentPujaId) => set({ currentPujaId }),
  setCurrentYear: (currentYear) => set({ currentYear }),
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      try {
        if (user) {
          window.localStorage.setItem('authUser', JSON.stringify(user));
        } else {
          window.localStorage.removeItem('authUser');
        }
      } catch {}
    }
    set({ user, hydrated: true });
  },
  hydrateAuthFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('authUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ user: parsed, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem('authUser'); } catch {}
    }
    set({ user: null });
  },
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Computed values
  // Filtering helpers
  isPlatformAdmin: () => {
    const { user } = get();
    return !!user && user.role === 'platform_admin';
  },
  isClubAdmin: () => {
    const { user } = get();
    return !!user && user.role === 'club_admin';
  },

  getFilteredMembers: () => {
    const { members, currentClubId, currentPujaId } = get();
    const byClub = currentClubId ? members.filter(m => m.clubId === currentClubId) : members;
    // Members are club-scoped; contributions are per puja
    return byClub;
  },

  getFilteredExpenses: () => {
    const { expenses, currentClubId, currentYear, currentPujaId } = get();
    return expenses.filter(e => (
      (!currentClubId || e.clubId === currentClubId) &&
      (!currentYear || (e.year ?? (e.date ? new Date(e.date).getFullYear() : null)) === currentYear) &&
      (!currentPujaId || e.pujaId === currentPujaId)
    ));
  },

  getFilteredTasks: () => {
    const { tasks, currentClubId, currentYear, currentPujaId } = get();
    return tasks.filter(t => (
      (!currentClubId || t.clubId === currentClubId) &&
      (!currentYear || (t.year ?? (t.dueDate ? new Date(t.dueDate).getFullYear() : null)) === currentYear) &&
      (!currentPujaId || t.pujaId === currentPujaId)
    ));
  },

  getFilteredInventory: () => {
    const { inventory, currentClubId, currentYear, currentPujaId } = get();
    return inventory.filter(i => (
      (!currentClubId || i.clubId === currentClubId) &&
      (!currentYear || (i.year ?? null) === currentYear) &&
      (!currentPujaId || i.pujaId === currentPujaId)
    ));
  },

  getFilteredSponsors: () => {
    const { sponsors, currentClubId, currentYear, currentPujaId } = get();
    return sponsors.filter(s => (
      (!currentClubId || s.clubId === currentClubId) &&
      (!currentYear || (s.year ?? null) === currentYear) &&
      (!currentPujaId || s.pujaId === currentPujaId)
    ));
  },

  getFilteredEvents: () => {
    const { events, currentClubId, currentYear, currentPujaId } = get();
    return events.filter(ev => (
      (!currentClubId || ev.clubId === currentClubId) &&
      (!currentYear || (ev.year ?? (ev.date ? new Date(ev.date).getFullYear() : null)) === currentYear) &&
      (!currentPujaId || ev.pujaId === currentPujaId)
    ));
  },

  getFilteredParticipants: () => {
    const { participants, currentClubId, currentYear, currentPujaId } = get();
    return participants.filter(p => (
      (!currentClubId || p.clubId === currentClubId) &&
      (!currentYear || (p.year ?? null) === currentYear) &&
      (!currentPujaId || p.pujaId === currentPujaId)
    ));
  },

  getFilteredPrizes: () => {
    const { prizes, currentClubId, currentYear } = get();
    return prizes.filter(p => (
      (!currentClubId || p.clubId === currentClubId) &&
      (!currentYear || (p.year ?? null) === currentYear)
    ));
  },

  getTotalCollected: () => {
    // Sum contributions collection per puja instead of member field
    const { contributions, currentClubId, currentPujaId } = get();
    const list = contributions.filter(c => (
      (!currentClubId || c.clubId === currentClubId) && (!currentPujaId || c.pujaId === currentPujaId)
    ));
    return list.reduce((total, c) => total + (c.amount || 0), 0);
  },

  getTotalSpent: () => {
    const expenses = get().getFilteredExpenses();
    return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
  },

  getRemainingBalance: () => {
    const totalCollected = get().getTotalCollected();
    const totalSpent = get().getTotalSpent();
    return totalCollected - totalSpent;
  },

  // New computed values
  getUpcomingTasks: () => {
    const tasks = get().getFilteredTasks();
    const today = new Date();
    return tasks.filter(task => 
      !task.completed && 
      new Date(task.dueDate) > today
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  },

  getPendingItems: () => {
    const inventory = get().getFilteredInventory();
    return inventory.filter(item => !item.received);
  },

  getCompletedTasks: () => {
    const tasks = get().tasks;
    return tasks.filter(task => task.completed);
  },

  getTotalDonations: () => {
    const sponsors = get().getFilteredSponsors();
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
    const { members } = get();
    const events = get().getFilteredEvents();
    const participants = get().getFilteredParticipants();
    const prizes = get().getFilteredPrizes();
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
    clubs: [],
    pujas: [],
    currentClubId: null,
    currentYear: new Date().getFullYear(),
    loading: false,
    error: null
  })
}));

export default useStore;
