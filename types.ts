export enum BookCondition {
  NEW = 'New',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  DAMAGED = 'Damaged'
}

export enum ReadStatus {
  UNREAD = 'Unread',
  READING = 'Reading',
  COMPLETED = 'Completed',
  DNF = 'Did Not Finish',
  WISHLIST = 'Wishlist'
}

export interface Location {
  id: string;
  name: string;
  type: string; // 'Room' | 'Shelf' | 'Box' | Custom
  parentId?: string;
  imageUrl?: string;
}

export interface Loan {
  id: string;
  bookId: string;
  borrowerName: string;
  loanDate: string;
  returnDate?: string;
  notes?: string;
}

export interface MediaAdaptation {
  title: string;
  type: 'Movie' | 'TV Series' | 'Play' | 'Documentary';
  youtubeLink?: string; // YouTube URL or Video ID
  description?: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  coverUrl?: string;
  summary?: string;
  genres: string[];
  tags: string[];
  totalPages?: number;
  publisher?: string;
  publishedDate?: string;
  language?: string; // Koillection feature
  
  // Series
  series?: string; // Koillection feature
  seriesIndex?: string; // Koillection feature (string to allow "1.5")

  // Custom Data
  customFields?: Record<string, string>; // Koillection feature

  isFirstEdition: boolean;
  isSigned: boolean;
  condition: BookCondition;
  purchasePrice?: number;
  estimatedValue?: number;
  purchaseDate?: string;
  locationId?: string;
  addedDate: string;
  addedByUserId: string;
  isPublic?: boolean; // Koillection feature (Public sharing)

  amazonLink?: string;
  minAge?: number;
  parentalAdvice?: string;
  understandingGuide?: string;
  mediaAdaptations?: MediaAdaptation[];
  culturalReference?: string;
  
  status: ReadStatus; // Track if it's owned or wishlist
}

export interface ReadEntry {
  bookId: string;
  status: ReadStatus;
  dateFinished?: string;
  rating?: number;
  readCount?: number;
}

export interface Persona {
  universe: string;
  character: string;
  reason: string;
}

export type ParentRole = 'Dad' | 'Mom' | 'Guardian' | 'Other';
export type EducationLevel = 'Preschool' | 'Elementary' | 'High School' | 'Undergraduate' | 'Postgraduate' | 'Doctorate' | 'Self-Taught' | 'Other';

export interface User {
  id: string;
  name: string;
  email?: string;
  dob: string; // ISO Date String
  age?: number; // Calculated
  grade?: string; // Calculated
  gender: 'Male' | 'Female' | 'Other';
  
  parentRole?: ParentRole; // Only for Admins
  educationLevel: EducationLevel;
  profession?: string;

  avatarSeed: string;
  history: ReadEntry[];
  favorites: string[];
  role: 'Admin' | 'User';
  personas?: Persona[];
}

export interface AiSettings {
  provider: 'gemini' | 'ollama';
  ollamaUrl: string;
  ollamaModel: string;
}

export interface DbSettings {
  type: 'sqlite' | 'postgres';
  host?: string;
  user?: string;
  password?: string;
  name: string;
}

export interface BackupSettings {
  frequency: 'weekly' | 'daily' | 'manual';
  location: 'local' | 'drive' | 'nas';
  lastBackupDate?: string;
  nasPath?: string;
  googleDriveConnected: boolean;
  googleDriveUser?: string;
}

export interface AppState {
  isSetupComplete: boolean;
  isDemoMode: boolean;
  books: Book[];
  users: User[];
  locations: Location[];
  loans: Loan[];
  currentUser: string | null;
  theme: 'dark' | 'light';
  aiSettings: AiSettings;
  dbSettings: DbSettings;
  backupSettings: BackupSettings;
}

export interface AiRecommendation {
  title: string;
  author: string;
  reason: string;
  type: 'READ_NEXT' | 'BUY_NEXT';
}
