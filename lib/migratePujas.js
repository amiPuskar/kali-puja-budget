// Migration utility to move puja data from localStorage to Firebase
import { addDocument, COLLECTIONS } from './firebase';

export const migratePujasToFirebase = async () => {
  try {
    // Check if pujas exist in localStorage
    const savedPujas = localStorage.getItem('pujas');
    
    if (savedPujas) {
      const parsedPujas = JSON.parse(savedPujas);
      console.log('Found pujas in localStorage:', parsedPujas);
      
      // Migrate each puja to Firebase
      for (const puja of parsedPujas) {
        try {
          // Remove the id from localStorage data since Firebase will generate new ones
          const { id, ...pujaData } = puja;
          
          // Add to Firebase
          const docId = await addDocument(COLLECTIONS.PUJAS, pujaData);
          console.log(`Migrated puja "${puja.name}" with new ID: ${docId}`);
        } catch (error) {
          console.error(`Error migrating puja "${puja.name}":`, error);
        }
      }
      
      // Clear localStorage after successful migration
      localStorage.removeItem('pujas');
      console.log('Migration completed. localStorage pujas cleared.');
      
      return true;
    } else {
      console.log('No pujas found in localStorage to migrate.');
      return false;
    }
  } catch (error) {
    console.error('Error during puja migration:', error);
    return false;
  }
};

// Function to initialize default pujas if none exist - REMOVED
// No default pujas will be created automatically
