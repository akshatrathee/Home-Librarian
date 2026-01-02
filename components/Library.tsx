import React, { useState } from 'react';
import { AppState, Book, ReadStatus } from '../types';
import { Icons } from './Icons';

interface LibraryProps {
  state: AppState;
  onSelectBook: (b: Book) => void;
  onScan: () => void;
  onProfile: () => void;
}

export const Library: React.FC<LibraryProps> = ({ state, onSelectBook, onScan, onProfile }) => {
  const { books, currentUser } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'favorites'>('all');

  const activeUser = state.users.find(u => u.id === currentUser);

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'unread') {
        // If current user hasn't finished it
        const isRead = activeUser?.history.some(h => h.bookId === b.id && h.status === ReadStatus.COMPLETED);
        matchesFilter = !isRead;
    } else if (filter === 'favorites') {
        matchesFilter = activeUser?.favorites.includes(b.id) || false;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="relative flex h-full w-full flex-col bg-gray-50 dark:bg-background-dark min-h-screen pb-28">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Library</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{books.length} Books • {filter === 'all' ? 'View All' : filter}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={onScan}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors"
            >
              <Icons.Scan size={24} />
            </button>
            <button 
                onClick={onProfile}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 p-[2px]"
            >
              <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center overflow-hidden text-[10px] font-bold text-white">
                {activeUser?.name?.charAt(0) || 'U'}
              </div>
            </button>
          </div>
        </div>
        <div className="px-5 py-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Icons.Search size={20} />
            </div>
            <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-surface-dark border-0 rounded-xl focus:ring-2 focus:ring-primary placeholder-slate-400 dark:placeholder-slate-500 transition-shadow shadow-sm" 
                placeholder="Title, author, ISBN..." 
                type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto no-scrollbar">
          <button 
             onClick={() => setFilter('all')}
             className={`flex shrink-0 items-center gap-1.5 h-8 px-3 rounded-lg border transition-all active:scale-95 ${filter === 'all' ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-surface-dark border-transparent text-slate-700 dark:text-slate-300'}`}
          >
            <span className="text-xs font-semibold">All Books</span>
          </button>
          
          <button 
             onClick={() => setFilter('unread')}
             className={`flex shrink-0 items-center gap-1.5 h-8 px-3 rounded-lg border transition-all active:scale-95 ${filter === 'unread' ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-surface-dark border-transparent text-slate-700 dark:text-slate-300'}`}
          >
            <span className="text-xs font-semibold">Unread</span>
          </button>

          <button 
             onClick={() => setFilter('favorites')}
             className={`flex shrink-0 items-center gap-1.5 h-8 px-3 rounded-lg border transition-all active:scale-95 ${filter === 'favorites' ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-surface-dark border-transparent text-slate-700 dark:text-slate-300'}`}
          >
            <span className="text-xs font-semibold">Favorites</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 pb-32 no-scrollbar">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {filteredBooks.map(book => (
                <div key={book.id} className="group flex flex-col gap-3 cursor-pointer" onClick={() => onSelectBook(book)}>
                    <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-gray-800 ring-1 ring-white/10 group-hover:ring-primary/50 transition-all duration-300 group-hover:shadow-glow group-hover:-translate-y-1">
                        {book.coverUrl ? (
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: `url('${book.coverUrl}')`}}></div>
                        ) : (
                            <div className="absolute inset-0 bg-slate-700 flex items-center justify-center text-slate-500"><Icons.Book size={48} /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        
                        {/* Status Icon */}
                        {activeUser?.history.some(h => h.bookId === book.id && h.status === ReadStatus.COMPLETED) && (
                            <div className="absolute top-2 right-2">
                                <div className="bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                                    <Icons.Check className="text-emerald-400" size={16} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{book.author}</p>
                    </div>
                </div>
            ))}
        </div>
        
        {filteredBooks.length === 0 && (
            <div className="text-center py-12">
                <Icons.Search className="mx-auto text-slate-600 mb-2" size={48} />
                <p className="text-slate-500">No books found in this view.</p>
            </div>
        )}
      </main>
    </div>
  );
};