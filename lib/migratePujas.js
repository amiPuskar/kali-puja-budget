// Migration utility to move puja data from localStorage to Firebase
import { addDocument, COLLECTIONS } from './firebase';

export const migratePujasToFirebase = async () => {
  try {
    // Check if migration has already been completed
    const migrationCompleted = localStorage.getItem('pujaMigrationCompleted');
    if (migrationCompleted) {
      console.log('Puja migration already completed, skipping...');
      return false;
    }

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
      
      // Mark migration as completed and clear localStorage
      localStorage.setItem('pujaMigrationCompleted', 'true');
      localStorage.removeItem('pujas');
      console.log('Migration completed. localStorage pujas cleared.');
      
      return true;
    } else {
      console.log('No pujas found in localStorage to migrate.');
      // Mark migration as completed even if no data to migrate
      localStorage.setItem('pujaMigrationCompleted', 'true');
      return false;
    }
  } catch (error) {
    console.error('Error during puja migration:', error);
    return false;
  }
};

// Function to initialize default pujas if none exist - REMOVED
// No default pujas will be created automatically

// Utility function to reset migration flag (for testing purposes)
export const resetMigrationFlag = () => {
  localStorage.removeItem('pujaMigrationCompleted');
  console.log('Migration flag reset. Migration will run on next page load.');
};
