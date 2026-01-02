import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Library } from './components/Library';
import { Scanner } from './components/Scanner';
import { Profile } from './components/Profile';
import { Onboarding } from './components/Onboarding';
import { LoansManager } from './components/LoansManager';
import { BookDetails } from './components/BookDetails';
import { Settings } from './components/Settings';
import { UserModal } from './components/UserModal';
import { LoanModal } from './components/LoanModal';
import { Icons } from './components/Icons';
import { loadState, saveState } from './services/storageService';
import { AppState, Book, User, Loan } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [currentView, setCurrentView] = useState<'dashboard' | 'library' | 'loans' | 'profile' | 'scanner'>('dashboard');
  
  // Global Overlays
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loanBook, setLoanBook] = useState<Book | null>(null);

  // Persist state
  useEffect(() => {
    saveState(state);
    if(state.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.add('dark'); 
    }
  }, [state]);

  // ONBOARDING FLOW
  if (!state.isSetupComplete) {
      return <Onboarding onComplete={(data) => {
          setState(prev => ({
              ...prev,
              isSetupComplete: true,
              aiSettings: { provider: data.aiProvider, ollamaUrl: data.ollamaUrl, ollamaModel: data.ollamaModel },
              users: data.users,
              locations: data.rooms,
              books: data.starterBooks,
              dbSettings: data.dbSettings,
              currentUser: data.users.find(u => u.role === 'Admin')?.id || null
          }));
      }} />;
  }

  const activeUser = state.users.find(u => u.id === state.currentUser) || state.users[0];

  // --- HANDLERS ---
  const handleUpdateBook = (updatedBook: Book) => {
    setState(prev => ({
        ...prev,
        books: prev.books.map(b => b.id === updatedBook.id ? updatedBook : b)
    }));
    // If we updated the currently selected book, update it locally too so UI refreshes
    if (selectedBook && selectedBook.id === updatedBook.id) {
        setSelectedBook(updatedBook);
    }
  };

  const handleDeleteBook = () => {
      if (selectedBook) {
          setState(prev => ({...prev, books: prev.books.filter(b => b.id !== selectedBook.id)}));
          setSelectedBook(null);
      }
  };

  const handleCreateLoan = (loan: Loan) => {
      setState(prev => ({...prev, loans: [...prev.loans, loan]}));
      setLoanBook(null);
      // Close details if open? Maybe keep it open
      // setSelectedBook(null); 
  };

  const handleUpdateUser = (user: User) => {
      const exists = state.users.find(u => u.id === user.id);
      setState(prev => ({
          ...prev,
          users: exists 
            ? prev.users.map(u => u.id === user.id ? user : u) 
            : [...prev.users, user]
      }));
      setShowUserModal(false);
  };

  const handleScanComplete = (newBook: Book) => {
    const bookWithUser = { ...newBook, addedByUserId: activeUser.id };
    setState(prev => ({
      ...prev,
      books: [...prev.books, bookWithUser]
    }));
    setCurrentView('library');
    // Optionally open the book details immediately
    setSelectedBook(bookWithUser);
  };

  const getLocationName = (id?: string) => {
      if (!id) return 'Unassigned';
      const loc = state.locations.find(l => l.id === id);
      if (!loc) return 'Unknown';
      
      if (loc.parentId) {
          const parent = state.locations.find(l => l.id === loc.parentId);
          return parent ? `${parent.name} > ${loc.name}` : loc.name;
      }
      return loc.name;
  };

  return (
    <div className="min-h-screen font-display bg-background-dark text-white">
      {currentView === 'dashboard' && (
        <Dashboard 
            state={state} 
            onProfile={() => setCurrentView('profile')}
            onNotifications={() => setCurrentView('loans')}
            onSelectBook={setSelectedBook}
        />
      )}
      
      {currentView === 'library' && (
        <Library 
            state={state} 
            onSelectBook={setSelectedBook}
            onScan={() => setCurrentView('scanner')}
            onProfile={() => setCurrentView('profile')}
        />
      )}
      
      {currentView === 'loans' && <LoansManager state={state} onUpdateState={setState} />}
      
      {currentView === 'profile' && (
        <Profile 
            user={activeUser} 
            allBooks={state.books} 
            onUpdateUser={handleUpdateUser}
            onSettings={() => setShowSettings(true)}
            onAddUser={() => setShowUserModal(true)}
            onBack={() => setCurrentView('dashboard')}
        />
      )}
      
      {currentView === 'scanner' && (
        <Scanner onClose={() => setCurrentView('dashboard')} onScanComplete={handleScanComplete} />
      )}

      {/* --- MODALS & OVERLAYS --- */}
      
      {selectedBook && (
          <BookDetails 
            book={selectedBook}
            currentUser={activeUser}
            users={state.users}
            locations={state.locations}
            getLocationName={getLocationName}
            onClose={() => setSelectedBook(null)}
            onUpdateBook={handleUpdateBook}
            onDelete={handleDeleteBook}
            onLoan={() => setLoanBook(selectedBook)}
          />
      )}

      {showSettings && (
          <Settings 
            state={state} 
            onUpdateState={(partial) => setState(prev => ({...prev, ...partial}))} 
            onClose={() => setShowSettings(false)} 
          />
      )}

      {showUserModal && (
          <UserModal 
            onSave={handleUpdateUser} 
            onClose={() => setShowUserModal(false)} 
          />
      )}

      {loanBook && (
          <LoanModal 
            book={loanBook} 
            users={state.users}
            onConfirm={handleCreateLoan}
            onClose={() => setLoanBook(null)}
          />
      )}

      {/* --- NAVIGATION --- */}

      {currentView !== 'scanner' && !selectedBook && (
        <nav className="fixed bottom-0 left-0 w-full z-40 bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/5 pb-safe safe-area-bottom">
            <div className="flex justify-around items-center h-[68px]">
                <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${currentView === 'dashboard' ? 'text-primary relative' : 'text-gray-400 hover:text-white'}`}>
                    {currentView === 'dashboard' && <span className="absolute -top-[1px] w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>}
                    <Icons.Dashboard size={26} />
                    <span className="text-[10px] font-semibold">Home</span>
                </button>
                <button onClick={() => setCurrentView('library')} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${currentView === 'library' ? 'text-primary relative' : 'text-gray-400 hover:text-white'}`}>
                    {currentView === 'library' && <span className="absolute -top-[1px] w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>}
                    <Icons.Library size={26} />
                    <span className="text-[10px] font-medium">Library</span>
                </button>
                
                <button onClick={() => setCurrentView('scanner')} className="size-14 rounded-full bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/40 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 mb-8">
                    <Icons.Plus size={30} />
                </button>

                <button onClick={() => setCurrentView('loans')} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${currentView === 'loans' ? 'text-primary relative' : 'text-gray-400 hover:text-white'}`}>
                    {currentView === 'loans' && <span className="absolute -top-[1px] w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>}
                    <Icons.Loan size={26} />
                    <span className="text-[10px] font-medium">Loans</span>
                </button>
                <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${currentView === 'profile' ? 'text-primary relative' : 'text-gray-400 hover:text-white'}`}>
                    {currentView === 'profile' && <span className="absolute -top-[1px] w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>}
                    <Icons.User size={26} />
                    <span className="text-[10px] font-medium">Profile</span>
                </button>
            </div>
        </nav>
      )}
    </div>
  );
};

export default App;