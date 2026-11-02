'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase';
import { migratePujasToFirebase } from '@/lib/migratePujas';

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
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    let unsubscribe;

    setLoading(true);
    setLoadError(null);

    const handleSnapshot = (data) => {
      if (!isActive) return;

      try {
        console.log('Pujas loaded from Firebase:', data);

        if (!data || data.length === 0) {
          setPujas([]);
          setCurrentPuja(null);
          setLoading(false);
          return;
        }

        setPujas(data);

        const savedCurrentPuja = localStorage.getItem('currentPuja');
        let selectedPuja;

        try {
          const parsedCurrentPuja = savedCurrentPuja ? JSON.parse(savedCurrentPuja) : null;
          selectedPuja = data.find((puja) => puja.id === parsedCurrentPuja?.id);
        } catch (error) {
          console.error('Error parsing saved current puja:', error);
        }

        if (!selectedPuja) {
          selectedPuja = [...data].sort(
            (a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id)
          )[0];
        }

        setCurrentPuja(selectedPuja);
        localStorage.setItem('currentPuja', JSON.stringify(selectedPuja));
        setLoading(false);
      } catch (error) {
        console.error('Error processing Puja data:', error);
        setLoadError(error.message || 'Unable to load Puja data.');
        setLoading(false);
      }
    };

    const handleError = (error) => {
      if (!isActive) return;
      console.error('Error loading Pujas from Firebase:', error);
      setLoadError(error.message || 'Unable to load Puja data from Firebase.');
      setLoading(false);
    };

    unsubscribe = subscribeToCollection(COLLECTIONS.PUJAS, handleSnapshot, handleError);
    migratePujasToFirebase().catch((error) => {
      console.error('Error migrating saved Pujas:', error);
    });

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, [reloadKey]);

  const retryLoading = () => {
    setReloadKey((key) => key + 1);
  };

  const createPuja = async (pujaData) => {
    try {
      // Check for duplicate puja (same name and year)
      const existingPuja = pujas.find(p => 
        p.name === pujaData.name && p.year === pujaData.year
      );
      
      if (existingPuja) {
        throw new Error(`A puja with name "${pujaData.name}" and year ${pujaData.year} already exists.`);
      }

      const pujaToCreate = {
        ...pujaData,
        status: pujaData.status || 'active'
      };
      
      const docId = await addDocument(COLLECTIONS.PUJAS, pujaToCreate);
      console.log('Puja created with ID:', docId);
      
      const newPuja = { id: docId, ...pujaToCreate };
      
      // Automatically select the newly created puja
      setCurrentPuja(newPuja);
      localStorage.setItem('currentPuja', JSON.stringify(newPuja));
      console.log('Auto-selected newly created puja:', newPuja.name);
      
      return newPuja;
    } catch (error) {
      console.error('Error creating puja:', error);
      throw error;
    }
  };

  const updatePuja = async (pujaId, updates) => {
    try {
      await updateDocument(COLLECTIONS.PUJAS, pujaId, updates);
      console.log('Puja updated:', pujaId);
      
      // Update current puja if it's the one being updated
      if (currentPuja && currentPuja.id === pujaId) {
        const updatedCurrentPuja = { ...currentPuja, ...updates };
        setCurrentPuja(updatedCurrentPuja);
        localStorage.setItem('currentPuja', JSON.stringify(updatedCurrentPuja));
      }
    } catch (error) {
      console.error('Error updating puja:', error);
      throw error;
    }
  };

  const deletePuja = async (pujaId) => {
    try {
      await deleteDocument(COLLECTIONS.PUJAS, pujaId);
      console.log('Puja deleted:', pujaId);
      
      // If current puja is deleted, switch to most recent remaining puja
      if (currentPuja && currentPuja.id === pujaId) {
        const remainingPujas = pujas.filter(p => p.id !== pujaId);
        if (remainingPujas.length > 0) {
          const mostRecentPuja = remainingPujas.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id))[0];
          setCurrentPuja(mostRecentPuja);
          localStorage.setItem('currentPuja', JSON.stringify(mostRecentPuja));
          console.log('Deleted current puja, switched to most recent remaining puja:', mostRecentPuja.name);
        } else {
          setCurrentPuja(null);
          localStorage.removeItem('currentPuja');
          console.log('Deleted current puja, no remaining pujas');
        }
      }
    } catch (error) {
      console.error('Error deleting puja:', error);
      throw error;
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
    loadError,
    retryLoading,
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
