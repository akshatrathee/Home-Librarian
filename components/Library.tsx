import React, { useState, useEffect } from 'react';
import { AppState, Book, User, ReadStatus } from '../types';
import { Icons } from './Icons';
import { BookDetails } from './BookDetails';

interface LibraryProps {
  state: AppState;
  onEditBook: (b: Book) => void;
  onDeleteBook: (id: string) => void;
  onLoanBook: (b: Book) => void;
}

export const Library: React.FC<LibraryProps> = ({ state, onEditBook, onDeleteBook, onLoanBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLoc, setFilterLoc] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'collection' | 'wishlist'>('collection');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const { books, locations, loans, users, currentUser } = state;
  const activeUser = users.find(u => u.id === currentUser);

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.series && b.series.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLoc = filterLoc === 'all' || b.locationId === filterLoc;
    
    const matchesView = viewMode === 'wishlist' 
        ? b.status === ReadStatus.WISHLIST 
        : b.status !== ReadStatus.WISHLIST;

    return matchesSearch && matchesLoc && matchesView;
  });

  const getLocationName = (id?: string) => {
    if(!id) return 'Unassigned';
    return locations.find(l => l.id === id)?.name || 'Unknown';
  };

  const getLoanStatus = (bookId: string) => {
    const activeLoan = loans.find(l => l.bookId === bookId && !l.returnDate);
    return activeLoan ? `Loaned to ${activeLoan.borrowerName}` : null;
  };

  const isAgeInappropriate = (book: Book) => {
    if (!activeUser?.age || !book.minAge) return false;
    return activeUser.age < book.minAge;
  };

  const startListening = () => {
      // @ts-ignore - Web Speech API
      if (!('webkitSpeechRecognition' in window)) {
          alert("Speech recognition not supported in this browser");
          return;
      }
      // @ts-ignore
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchTerm(transcript);
      };
      recognition.start();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* View Toggle */}
      <div className="flex gap-4 mb-4 border-b border-slate-800 pb-4">
          <button 
             onClick={() => setViewMode('collection')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${viewMode === 'collection' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
              <Icons.Library size={18} /> Collection
          </button>
          <button 
             onClick={() => setViewMode('wishlist')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${viewMode === 'wishlist' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
              <Icons.Star size={18} /> Wishlist
          </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center z-20 relative">
        <div className="relative w-full md:w-96">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search title, author, series..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 backdrop-blur border border-slate-700 text-white pl-10 pr-10 py-2 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
          <button 
            onClick={startListening}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`}
          >
              <Icons.Mic size={18} />
          </button>
        </div>
        
        {viewMode === 'collection' && (
            <select 
            value={filterLoc} 
            onChange={e => setFilterLoc(e.target.value)}
            className="bg-slate-800/80 backdrop-blur border border-slate-700 text-white px-4 py-2 rounded-lg outline-none w-full md:w-auto cursor-pointer hover:bg-slate-700"
            >
            <option value="all">All Locations</option>
            {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
            ))}
            </select>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-24">
        {filteredBooks.map(book => {
          const loanStatus = getLoanStatus(book.id);
          const isLocked = isAgeInappropriate(book);

          return (
            <div 
                key={book.id} 
                onClick={() => !isLocked && setSelectedBook(book)}
                className={`group relative rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-30 hover:shadow-2xl aspect-[2/3] cursor-pointer ${isLocked ? 'grayscale opacity-60' : ''}`}
            >
              {/* Washout Background */}
              <div 
                 className="absolute inset-0 bg-cover bg-center opacity-40 blur-xl scale-150"
                 style={{ backgroundImage: `url(${book.coverUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-3 flex flex-col justify-end z-10">
                  {/* Cover Image Floating */}
                  <div className="absolute inset-0 flex items-center justify-center -z-10">
                      {book.coverUrl ? (
                         <img src={book.coverUrl} className="w-full h-full object-cover rounded-sm shadow-lg" alt="" />
                      ) : (
                         <Icons.Book className="text-slate-600" size={48} />
                      )}
                  </div>

                  {/* Overlays */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[2px]">
                        <Icons.Lock className="text-red-500 mb-2" size={32} />
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">MATURE {book.minAge}+</span>
                    </div>
                  )}
                  
                  {/* Series Badge */}
                  {book.series && (
                      <div className="absolute top-2 left-2 bg-indigo-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                          <Icons.Library size={10} /> {book.series} #{book.seriesIndex}
                      </div>
                  )}

                  {loanStatus && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                          LOANED
                      </div>
                  )}

                  {/* Info appearing on hover */}
                  <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-slate-950/90 backdrop-blur-md p-3 -m-3 mt-auto rounded-t-xl border-t border-slate-700/50">
                      <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 mb-1">{book.title}</h3>
                      <p className="text-indigo-400 text-xs mb-2">{book.author}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>{getLocationName(book.locationId)}</span>
                          <div className="flex gap-2">
                             {!isLocked && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); onEditBook(book); }} className="hover:text-white"><Icons.Edit size={12}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }} className="hover:text-red-400"><Icons.Delete size={12}/></button>
                                </>
                             )}
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredBooks.length === 0 && (
         <div className="text-center text-slate-500 mt-20">
            <Icons.Book size={48} className="mx-auto mb-4 opacity-50" />
            <p>No books found. {viewMode === 'wishlist' ? 'Wishlist is empty.' : 'Try scanning one!'}</p>
         </div>
      )}

      {selectedBook && activeUser && (
          <BookDetails 
             book={selectedBook} 
             currentUser={activeUser}
             users={users}
             locations={locations}
             getLocationName={getLocationName}
             onClose={() => setSelectedBook(null)}
             onLoan={() => onLoanBook(selectedBook)}
             onUpdateBook={(b) => {
                 onEditBook(b);
                 setSelectedBook(b);
             }}
          />
      )}
    </div>
  );
};