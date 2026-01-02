import { AppState, Book, User, Location, BookCondition, ReadStatus } from '../types';

const STORAGE_KEY = 'home_librarian_v5';

// Helpers
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const calculateAge = (dob: string): number => {
    if(!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

export const calculateGrade = (dob: string): string => {
    const age = calculateAge(dob);
    if (age < 3) return 'Toddler';
    if (age < 5) return 'Preschool';
    if (age < 6) return 'Kindergarten';
    if (age > 18) return 'Graduated';
    return `Grade ${age - 5}`;
};

// Core Library Starter Pack
export const STARTER_BOOKS: Partial<Book>[] = [
  { 
      isbn: '9780141439518', 
      title: 'Pride and Prejudice', 
      author: 'Jane Austen', 
      genres: ['Classic', 'Romance'], 
      tags: ['Essential'], 
      minAge: 12, 
      coverUrl: 'https://covers.openlibrary.org/b/id/14549557-L.jpg', 
      estimatedValue: 450, 
      summary: "A romantic novel of manners written by Jane Austen. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments.", 
      status: ReadStatus.UNREAD
  },
  { 
      isbn: '9780743273565', 
      title: 'The Great Gatsby', 
      author: 'F. Scott Fitzgerald', 
      genres: ['Classic', 'Fiction'], 
      tags: ['American Dream'], 
      minAge: 14, 
      coverUrl: 'https://covers.openlibrary.org/b/id/8408332-L.jpg', 
      estimatedValue: 600, 
      summary: "A novel set in the Jazz Age on Long Island. It tells the story of Jay Gatsby, a self-made millionaire, and his pursuit of Daisy Buchanan.", 
      status: ReadStatus.UNREAD
  },
  { 
      isbn: '9780439139601', 
      title: 'Harry Potter and the Sorcerer\'s Stone', 
      author: 'J.K. Rowling', 
      genres: ['Fantasy', 'Young Adult'], 
      tags: ['Magic', 'Wizards'], 
      minAge: 9, 
      coverUrl: 'https://covers.openlibrary.org/b/id/10522194-L.jpg', 
      estimatedValue: 800, 
      summary: "A young wizard discovers his magical heritage on his eleventh birthday when he receives a letter of acceptance to Hogwarts School of Witchcraft and Wizardry.", 
      series: 'Harry Potter', 
      seriesIndex: '1', 
      status: ReadStatus.UNREAD
  },
  {
      isbn: '9780345391803',
      title: 'The Hitchhiker\'s Guide to the Galaxy', 
      author: 'Douglas Adams',
      genres: ['Sci-Fi', 'Comedy'],
      tags: ['Space', 'Funny'],
      minAge: 10,
      coverUrl: 'https://covers.openlibrary.org/b/id/12632205-L.jpg',
      estimatedValue: 350,
      summary: "Seconds before the Earth is demolished to make way for a galactic freeway, Arthur Dent is plucked off the planet by his friend Ford Prefect.",
      status: ReadStatus.UNREAD
  }
];

const INITIAL_STATE: AppState = {
  isSetupComplete: false,
  isDemoMode: false,
  books: [],
  users: [],
  locations: [],
  loans: [],
  currentUser: null,
  theme: 'dark',
  aiSettings: { provider: 'gemini', ollamaUrl: 'http://localhost:11434', ollamaModel: 'llama3.2' },
  dbSettings: { type: 'sqlite', host: 'localhost', name: 'homelibrary' },
  backupSettings: { frequency: 'weekly', location: 'local', googleDriveConnected: false }
};

export const loadState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_STATE;
    const state = JSON.parse(stored);
    
    // Ensure all required fields exist (Migration)
    if (!state.dbSettings) state.dbSettings = INITIAL_STATE.dbSettings;
    if (!state.backupSettings) state.backupSettings = INITIAL_STATE.backupSettings;
    
    // Auto-update ages/grades based on DOB
    if (state.users) {
        state.users = state.users.map((u: User) => ({
            ...u,
            age: calculateAge(u.dob),
            grade: u.role === 'User' ? calculateGrade(u.dob) : u.educationLevel
        }));
    }
    
    return state;
  } catch (e) {
    console.error("Failed to load state", e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const resetToProduction = () => {
    saveState(INITIAL_STATE);
    return INITIAL_STATE;
};