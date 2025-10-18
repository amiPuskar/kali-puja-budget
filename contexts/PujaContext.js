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

  useEffect(() => {
    let unsubscribe;
    
    const initializePujas = async () => {
      try {
        // First, try to migrate any existing localStorage data
        await migratePujasToFirebase();
        
        // Then subscribe to Firebase data
        unsubscribe = subscribeToCollection(COLLECTIONS.PUJAS, async (data) => {
          console.log('🔄 Pujas loaded from Firebase:', data);
          console.log('📊 Data sync check - All users should see this same data');
          
          // If no pujas exist, just set empty array
          if (!data || data.length === 0) {
            console.log('No pujas found in Firebase.');
            setPujas([]);
            setCurrentPuja(null);
            setLoading(false);
            return;
          }
          
          setPujas(data);
          
          // Set current puja logic
          if (data.length > 0) {
            const savedCurrentPuja = localStorage.getItem('currentPuja');
            
            if (savedCurrentPuja) {
              try {
                const parsedCurrentPuja = JSON.parse(savedCurrentPuja);
                // Verify the saved puja still exists in Firebase data
                const pujaExists = data.find(p => p.id === parsedCurrentPuja.id);
                if (pujaExists) {
                  setCurrentPuja(pujaExists);
                  console.log('Restored saved current puja:', pujaExists.name);
                } else {
                  // Saved puja no longer exists, select the most recent puja
                  const mostRecentPuja = data.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id))[0];
                  setCurrentPuja(mostRecentPuja);
                  localStorage.setItem('currentPuja', JSON.stringify(mostRecentPuja));
                  console.log('Saved puja no longer exists, selected most recent puja:', mostRecentPuja.name);
                }
              } catch (error) {
                console.error('Error parsing saved current puja:', error);
                // Select the most recent puja as fallback
                const mostRecentPuja = data.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id))[0];
                setCurrentPuja(mostRecentPuja);
                localStorage.setItem('currentPuja', JSON.stringify(mostRecentPuja));
                console.log('Error parsing saved puja, selected most recent puja:', mostRecentPuja.name);
              }
            } else {
              // No saved puja preference, select the most recent puja
              const mostRecentPuja = data.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id))[0];
              setCurrentPuja(mostRecentPuja);
              localStorage.setItem('currentPuja', JSON.stringify(mostRecentPuja));
              console.log('No saved puja preference, auto-selected most recent puja:', mostRecentPuja.name);
            }
          } else {
            setCurrentPuja(null);
          }
          
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing pujas:', error);
        setLoading(false);
      }
    };
    
    initializePujas();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

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

