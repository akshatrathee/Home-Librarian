import React, { useState, useEffect } from 'react';
import { Icons } from './components/Icons';
import { Dashboard } from './components/Dashboard';
import { Library } from './components/Library';
import { Scanner } from './components/Scanner';
import { Profile } from './components/Profile';
import { LocationManager } from './components/LocationManager';
import { Onboarding } from './components/Onboarding';
import { Maintenance } from './components/Maintenance';
import { Settings } from './components/Settings';
import { LoansManager } from './components/LoansManager';
import { loadState, saveState, generateId, resetToProduction } from './services/storageService';
import { listOllamaModels } from './services/geminiService';
import { AppState, Book, User, Location, Loan } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [currentView, setCurrentView] = useState<'dashboard' | 'library' | 'loans' | 'profile' | 'maintenance'>('dashboard');
  const [showScanner, setShowScanner] = useState(false);
  const [showLocManager, setShowLocManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Ollama Models Fetching
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  useEffect(() => {
    if (showSettings && state.aiSettings.provider === 'ollama') {
        listOllamaModels(state.aiSettings.ollamaUrl).then(setAvailableModels);
    }
  }, [showSettings, state.aiSettings.provider, state.aiSettings.ollamaUrl]);

  // Persist state
  useEffect(() => {
    saveState(state);
    // Apply Theme
    if(state.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
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
              books: data.starterBooks, // SEED STARTER BOOKS
              dbSettings: data.dbSettings,
              currentUser: data.users.find(u => u.role === 'Admin')?.id || null
          }));
      }} />;
  }

  const activeUser = state.users.find(u => u.id === state.currentUser);

  // Login Screen
  if (!activeUser) {
    return (
       <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full text-center">
             <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                 <Icons.Book size={32} className="text-white" />
             </div>
             <h1 className="text-2xl font-bold text-white mb-2">Home Librarian</h1>
             <p className="text-slate-400 mb-8">Select Profile</p>
             <div className="grid grid-cols-2 gap-4 mb-8">
                 {state.users.map(u => (
                     <button key={u.id} onClick={() => setState(s => ({...s, currentUser: u.id}))} className="p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition flex flex-col items-center gap-2 border border-slate-700">
                         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
                             {u.name[0]}
                         </div>
                         <span className="text-white font-medium">{u.name}</span>
                     </button>
                 ))}
             </div>
             
             <div className="border-t border-slate-800 pt-6">
                 <button 
                    onClick={() => {
                        if(confirm("This will DELETE ALL DATA and start the onboarding wizard. Continue?")) {
                            setState(resetToProduction());
                        }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                >
                    Reset & Clear Data
                 </button>
             </div>
          </div>
       </div>
    );
  }

  const handleUpdateUser = (updatedUser: User) => {
    setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setState(prev => ({
        ...prev,
        books: prev.books.map(b => b.id === updatedBook.id ? updatedBook : b)
    }));
  };

  const handleScanComplete = (newBook: Book) => {
    const bookWithUser = { ...newBook, addedByUserId: activeUser.id };
    setState(prev => ({
      ...prev,
      books: [...prev.books, bookWithUser]
    }));
    setShowScanner(false);
    setCurrentView('library');
  };

  const handleLoanBook = (book: Book) => {
      const name = prompt("Loan to friend (Name):");
      if(name) {
          const loan: Loan = {
              id: generateId(),
              bookId: book.id,
              borrowerName: name,
              loanDate: new Date().toISOString()
          };
          setState(prev => ({ ...prev, loans: [...prev.loans, loan] }));
          if(confirm("Book loaned! Go to Loans tab?")) {
              setCurrentView('loans');
          }
      }
  };

  // Maintenance Notification Logic
  const homelessCount = state.books.filter(b => !b.locationId).length;
  // Overdue check (duplicate logic, but lightweight)
  const overdueCount = state.loans.filter(l => {
      if(l.returnDate) return false;
      const days = (Date.now() - new Date(l.loanDate).getTime()) / (1000 * 3600 * 24);
      return days > 30;
  }).length;
  const maintenanceCount = homelessCount + overdueCount;

  const NavItem = ({ view, icon: Icon, label, badge }: any) => (
    <button
      onClick={() => { setCurrentView(view); setSidebarOpen(false); }}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {badge > 0 && (
          <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
              {badge}
          </span>
      )}
    </button>
  );

  return (
    <div className={`min-h-screen flex font-sans ${state.theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 ${state.theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border-r z-50 transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
            <Icons.Book size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">Home Librarian</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Self Hosted</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem view="dashboard" icon={Icons.Dashboard} label="Dashboard" />
          <NavItem view="library" icon={Icons.Library} label="My Books" />
          <NavItem view="loans" icon={Icons.Loan} label="Loans" />
          <NavItem view="profile" icon={Icons.User} label="Profile & AI" />
          {activeUser.role === 'Admin' && (
              <NavItem 
                view="maintenance" 
                icon={Icons.Maintenance} 
                label="Maintenance" 
                badge={maintenanceCount}
              />
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50 space-y-2">
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 w-full transition-colors">
                 <Icons.Settings size={20} /> Settings
            </button>
            <div className="flex items-center justify-between px-4 py-2">
                 <span className="text-xs text-slate-500">Theme</span>
                 <button onClick={() => setState(s => ({...s, theme: s.theme === 'light' ? 'dark' : 'light'}))} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                      {state.theme === 'light' ? <Icons.Moon size={16}/> : <Icons.Sun size={16}/>}
                 </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className={`h-16 border-b ${state.theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-950/80 border-slate-800'} backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30 sticky top-0`}>
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-slate-400" onClick={() => setSidebarOpen(true)}>
                    <Icons.Library size={24} />
                </button>
                <h2 className="text-lg font-semibold capitalize hidden sm:block">
                    {currentView.replace('-', ' ')}
                </h2>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Icons.Scan size={18} />
                    <span className="hidden sm:inline">Scan</span>
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button 
                       onClick={() => setUserMenuOpen(!userMenuOpen)}
                       className={`flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border transition-colors ${state.theme === 'light' ? 'bg-slate-100 border-slate-200 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                    >
                         <span className="text-sm font-medium ml-1 hidden sm:inline">{activeUser.name}</span>
                         <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                             {activeUser.name.charAt(0)}
                         </div>
                    </button>
                    
                    {userMenuOpen && (
                        <div className={`absolute top-full right-0 mt-2 w-56 border rounded-xl shadow-2xl overflow-hidden z-50 ${state.theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                            <div className="p-3 border-b border-slate-700/50">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Profiles</p>
                                {state.users.map(u => (
                                    <button 
                                      key={u.id}
                                      onClick={() => { setState(s => ({...s, currentUser: u.id})); setUserMenuOpen(false); }}
                                      className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm ${u.id === activeUser.id ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-slate-500/10'}`}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-slate-500/20 flex items-center justify-center text-[10px]">{u.name[0]}</div>
                                        {u.name}
                                    </button>
                                ))}
                            </div>
                            <div className="p-2">
                                <button onClick={() => { setShowLocManager(true); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm hover:bg-slate-500/10">
                                     <Icons.Location size={14} /> Manage Locations
                                </button>
                                <button onClick={() => { setState(s => ({...s, currentUser: null})); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm hover:bg-red-500/10 text-red-500">
                                     <Icons.LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto relative">
          {currentView === 'dashboard' && <Dashboard state={state} />}
          {currentView === 'library' && (
            <Library 
                state={state} 
                onEditBook={handleUpdateBook} 
                onDeleteBook={(id) => setState(prev => ({...prev, books: prev.books.filter(b => b.id !== id)}))}
                onLoanBook={handleLoanBook}
            />
          )}
          {currentView === 'loans' && (
              <LoansManager state={state} onUpdateState={(s) => setState(s)} />
          )}
          {currentView === 'profile' && (
             <Profile 
                user={activeUser} 
                allBooks={state.books} 
                onUpdateUser={handleUpdateUser} 
             />
          )}
          {currentView === 'maintenance' && (
              <Maintenance state={state} onUpdateState={(s) => setState(s)} />
          )}
        </div>
      </main>

      {/* Modals */}
      {showScanner && (
        <Scanner onClose={() => setShowScanner(false)} onScanComplete={handleScanComplete} />
      )}

      {showLocManager && (
          <LocationManager 
             locations={state.locations}
             onAddLocation={(l) => setState(s => ({ ...s, locations: [...s.locations, l] }))}
             onUpdateLocation={(l) => setState(s => ({...s, locations: s.locations.map(loc => loc.id === l.id ? l : loc)}))}
             onClose={() => setShowLocManager(false)}
          />
      )}

      {showSettings && (
          <Settings 
             state={state} 
             onUpdateState={(updated) => setState({...state, ...updated})}
             onClose={() => setShowSettings(false)}
          />
      )}

    </div>
  );
};

export default App;