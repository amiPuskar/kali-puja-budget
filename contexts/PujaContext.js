'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const PujaContext = createContext();

export const usePuja = () => {
  const context = useContext(PujaContext);
  if (!context) {
    throw new Error('usePuja must be used within a PujaProvider');
  }
  return context;
};

export const PujaProvider = ({ children }) => {
  const [pujas, setPujas] = useState([]);
  const [currentPuja, setCurrentPuja] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load pujas from localStorage or initialize with default data
    const loadPujas = () => {
      try {
        const savedPujas = localStorage.getItem('pujas');
        const savedCurrentPuja = localStorage.getItem('currentPuja');
        
        if (savedPujas) {
          const parsedPujas = JSON.parse(savedPujas);
          setPujas(parsedPujas);
          
          if (savedCurrentPuja) {
            const parsedCurrentPuja = JSON.parse(savedCurrentPuja);
            setCurrentPuja(parsedCurrentPuja);
          } else if (parsedPujas.length > 0) {
            setCurrentPuja(parsedPujas[0]);
          }
        } else {
          // Initialize with default pujas
          const defaultPujas = [
            {
              id: '1',
              name: 'Kali Puja 2024',
              year: 2024,
              startDate: '2024-10-31',
              endDate: '2024-11-01',
              status: 'active',
              description: 'Annual Kali Puja celebration',
              managerId: '', // Will be assigned by Super Admin
              createdAt: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Durga Puja 2024',
              year: 2024,
              startDate: '2024-10-10',
              endDate: '2024-10-14',
              status: 'completed',
              description: 'Durga Puja celebration',
              managerId: '', // Will be assigned by Super Admin
              createdAt: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Kali Puja 2023',
              year: 2023,
              startDate: '2023-11-12',
              endDate: '2023-11-13',
              status: 'completed',
              description: 'Previous year Kali Puja',
              managerId: '', // Will be assigned by Super Admin
              createdAt: new Date().toISOString()
            }
          ];
          
          setPujas(defaultPujas);
          setCurrentPuja(defaultPujas[0]);
          localStorage.setItem('pujas', JSON.stringify(defaultPujas));
          localStorage.setItem('currentPuja', JSON.stringify(defaultPujas[0]));
        }
      } catch (error) {
        console.error('Error loading pujas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPujas();
  }, []);

  const createPuja = (pujaData) => {
    const newPuja = {
      id: Date.now().toString(),
      ...pujaData,
      status: pujaData.status || 'active',
      createdAt: new Date().toISOString()
    };
    
    const updatedPujas = [...pujas, newPuja];
    setPujas(updatedPujas);
    localStorage.setItem('pujas', JSON.stringify(updatedPujas));
    
    return newPuja;
  };

  const updatePuja = (pujaId, updates) => {
    const updatedPujas = pujas.map(puja => 
      puja.id === pujaId ? { ...puja, ...updates } : puja
    );
    setPujas(updatedPujas);
    localStorage.setItem('pujas', JSON.stringify(updatedPujas));
    
    // Update current puja if it's the one being updated
    if (currentPuja && currentPuja.id === pujaId) {
      const updatedCurrentPuja = { ...currentPuja, ...updates };
      setCurrentPuja(updatedCurrentPuja);
      localStorage.setItem('currentPuja', JSON.stringify(updatedCurrentPuja));
    }
  };

  const deletePuja = (pujaId) => {
    const updatedPujas = pujas.filter(puja => puja.id !== pujaId);
    setPujas(updatedPujas);
    localStorage.setItem('pujas', JSON.stringify(updatedPujas));
    
    // If current puja is deleted, switch to first available puja
    if (currentPuja && currentPuja.id === pujaId) {
      if (updatedPujas.length > 0) {
        setCurrentPuja(updatedPujas[0]);
        localStorage.setItem('currentPuja', JSON.stringify(updatedPujas[0]));
      } else {
        setCurrentPuja(null);
        localStorage.removeItem('currentPuja');
      }
    }
  };

  const switchPuja = (puja) => {
    setCurrentPuja(puja);
    localStorage.setItem('currentPuja', JSON.stringify(puja));
  };

  const getPujaById = (pujaId) => {
    return pujas.find(puja => puja.id === pujaId);
  };

  const getActivePujas = () => {
    return pujas.filter(puja => puja.status === 'active');
  };

  const getCompletedPujas = () => {
    return pujas.filter(puja => puja.status === 'completed');
  };

  const value = {
    pujas,
    currentPuja,
    loading,
    createPuja,
    updatePuja,
    deletePuja,
    switchPuja,
    getPujaById,
    getActivePujas,
    getCompletedPujas
  };

  return (
    <PujaContext.Provider value={value}>
      {children}
    </PujaContext.Provider>
  );
};
