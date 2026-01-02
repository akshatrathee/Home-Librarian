import React from 'react';
import { AppState, ReadStatus, Book } from '../types';
import { Icons } from './Icons';

interface DashboardProps {
  state: AppState;
  onProfile: () => void;
  onNotifications: () => void;
  onSelectBook: (book: Book) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onProfile, onNotifications, onSelectBook }) => {
  const { books, users, loans, currentUser } = state;
  const activeUser = users.find(u => u.id === currentUser);

  const totalValue = books.reduce((sum, b) => sum + (b.purchasePrice || 0), 0);
  const totalRead = users.reduce((sum, u) => sum + u.history.filter(h => h.status === ReadStatus.COMPLETED).length, 0);
  const readPercentage = books.length > 0 ? Math.round((totalRead / books.length) * 100) : 0;
  
  // Formatter
  const formatK = (val: number) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val;

  const overdueLoans = loans.filter(l => {
      if (l.returnDate) return false;
      const days = (Date.now() - new Date(l.loanDate).getTime()) / (1000 * 3600 * 24);
      return days > 30;
  });

  // Simple recommendation logic (random unread books)
  const recommendations = books
      .filter(b => !activeUser?.history.find(h => h.bookId === b.id))
      .slice(0, 5);

  return (
    <div className="bg-gray-50 dark:bg-background-dark min-h-screen pb-28">
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-all duration-300">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Icons.Book size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none text-slate-900 dark:text-white">BiblioPi</h1>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={onNotifications}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <Icons.AlertTriangle size={24} />
              {overdueLoans.length > 0 && <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>}
            </button>
            <button 
                onClick={onProfile}
                className="size-9 rounded-full bg-cover bg-center border border-gray-200 dark:border-white/10 bg-slate-700 flex items-center justify-center text-xs font-bold text-white" 
            >
                {activeUser?.name?.charAt(0) || 'U'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-8 pt-24">
        <section className="px-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 bg-white dark:bg-surface-card rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-75"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Library</p>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{books.length} <span className="text-base font-normal text-gray-500">Books</span></h2>
                </div>
                <div className="bg-green-500/10 text-green-500 rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-bold">
                  <Icons.Users size={14} /> +5
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(readPercentage, 100)}%` }}></div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">{readPercentage}% Read</p>
            </div>
            
            <div className="bg-white dark:bg-surface-card rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
              <div className="size-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
                <Icons.Money size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">${formatK(totalValue)}</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Asset Value</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-surface-card rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
              <div className="size-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2">
                <Icons.Star size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">Sarah</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Top Reader</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="px-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Read Next
              <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text text-xs font-extrabold uppercase tracking-wide border border-primary/30 rounded px-1.5 py-0.5">AI</span>
            </h3>
          </div>
          <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x">
            {recommendations.length > 0 ? recommendations.map((rec, i) => (
                <div key={rec.id} className="snap-start flex-none w-[280px] bg-surface-card rounded-2xl overflow-hidden border border-white/5 relative group shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                    <div className="h-[180px] w-full bg-cover bg-top" style={{backgroundImage: `url('${rec.coverUrl}')`}}></div>
                    <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Suggested</span>
                        </div>
                        <h4 className="text-lg font-bold text-white leading-tight mb-0.5 truncate">{rec.title}</h4>
                        <p className="text-gray-300 text-xs mb-3 truncate">{rec.author}</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onSelectBook(rec)}
                                className="flex-1 bg-white text-black text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-100 transition"
                            >
                                <Icons.Play size={14} /> Read
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="px-5 text-gray-500 text-sm italic">Read more books to get recommendations!</div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="px-5 flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Overdue Loans</h3>
            <div className="size-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">{overdueLoans.length}</div>
          </div>
          <div className="flex overflow-x-auto gap-3 px-5 pb-4 no-scrollbar snap-x">
             {overdueLoans.length > 0 ? overdueLoans.map(loan => (
                 <div key={loan.id} className="snap-start flex-none w-[260px] bg-surface-card rounded-xl p-3 border border-red-500/30 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none"></div>
                    <div className="flex gap-3 relative z-10">
                        <div className="w-16 h-24 rounded-lg bg-slate-800 bg-cover bg-center shadow-md shrink-0 flex items-center justify-center">
                            <Icons.Book size={24} className="text-slate-500" />
                        </div>
                        <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                            <div>
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Overdue</p>
                                <h4 className="text-sm font-bold text-white truncate leading-tight mb-0.5">{loan.bookId}</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="size-4 rounded-full bg-gray-600 flex items-center justify-center text-[8px]">{loan.borrowerName.charAt(0)}</div>
                                    <p className="text-xs text-gray-400 truncate">{loan.borrowerName}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onNotifications}
                                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-md self-start transition-colors flex items-center gap-1"
                            >
                                <Icons.AlertTriangle size={14} /> Remind
                            </button>
                        </div>
                    </div>
                 </div>
             )) : (
                 <div className="px-5 text-gray-500 text-sm">No loans are overdue.</div>
             )}
          </div>
        </section>
      </main>
    </div>
  );
};