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
          
          // Only set current puja if user has a saved preference
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
                  // Saved puja no longer exists, clear it
                  setCurrentPuja(null);
                  localStorage.removeItem('currentPuja');
                  console.log('Saved puja no longer exists, cleared current puja');
                }
              } catch (error) {
                console.error('Error parsing saved current puja:', error);
                setCurrentPuja(null);
                localStorage.removeItem('currentPuja');
              }
            } else {
              // No saved puja preference, don't auto-select
              setCurrentPuja(null);
              console.log('No saved puja preference, user must manually select');
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
      return { id: docId, ...pujaToCreate };
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
      
      // If current puja is deleted, switch to first available puja
      if (currentPuja && currentPuja.id === pujaId) {
        const remainingPujas = pujas.filter(p => p.id !== pujaId);
        if (remainingPujas.length > 0) {
          setCurrentPuja(remainingPujas[0]);
          localStorage.setItem('currentPuja', JSON.stringify(remainingPujas[0]));
        } else {
          setCurrentPuja(null);
          localStorage.removeItem('currentPuja');
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

