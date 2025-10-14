'use client';

// Demo in-memory data for offline/static mode

export const demoState = {
  clubs: [
    { id: 'club_1', name: 'Club One', email: 'clubone@example.com', password: 'club123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'club_2', name: 'Club Two', email: 'clubtwo@example.com', password: 'club123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  pujas: [
    { id: 'puja_1', clubId: 'club_1', name: 'Kali Puja', year: 2025, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'puja_2', clubId: 'club_1', name: 'Durga Puja', year: 2025, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  members: [
    { id: 'm_1', clubId: 'club_1', name: 'Alice', role: 'President', contribution: 5000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'm_2', clubId: 'club_1', name: 'Bob', role: 'Secretary', contribution: 3000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  expenses: [
    { id: 'e_1', clubId: 'club_1', description: 'Lights', amount: 2500, category: 'Sound & Lighting', date: new Date('2025-10-10').toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  tasks: [
    { id: 't_1', clubId: 'club_1', title: 'Arrange Flowers', priority: 'medium', dueDate: new Date('2025-10-20').toISOString(), completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  inventory: [],
  sponsors: [],
  budget: [],
  events: [],
  participants: [],
  prizes: []
};

export function demoList(collectionName) {
  return demoState[collectionName] ?? [];
}

export function demoAdd(collectionName, data) {
  const id = `${collectionName}_${Math.random().toString(36).slice(2)}`;
  const doc = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  demoState[collectionName] = [...(demoState[collectionName] ?? []), doc];
  return id;
}

export function demoUpdate(collectionName, id, data) {
  demoState[collectionName] = (demoState[collectionName] ?? []).map(d => d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d);
}

export function demoDelete(collectionName, id) {
  demoState[collectionName] = (demoState[collectionName] ?? []).filter(d => d.id !== id);
}


