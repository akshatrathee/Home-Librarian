import React, { useState } from 'react';
import { Book, User, Location, BookCondition, ReadStatus } from '../types';
import { Icons } from './Icons';

interface BookDetailsProps {
  book: Book;
  currentUser: User;
  users: User[];
  locations: Location[];
  getLocationName: (id?: string) => string;
  onClose: () => void;
  onLoan: () => void;
  onDelete: () => void;
  onUpdateBook: (book: Book) => void;
}

export const BookDetails: React.FC<BookDetailsProps> = ({ book, currentUser, users, getLocationName, locations, onClose, onUpdateBook, onDelete, onLoan }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBook, setEditedBook] = useState<Book>(book);

  // Logic to find who is reading or has read this book
  const readers = users.filter(u => u.history.some(h => h.bookId === book.id));

  const handleToggleRead = () => {
      // Simple toggle for current user
      const isRead = currentUser.history.some(h => h.bookId === book.id && h.status === ReadStatus.COMPLETED);
      // In a real implementation this would bubble up to App state, 
      // but for UI consistency we can just toggle the local visual if needed 
      // However, since we don't have an onUpdateUser prop here, we assume it's a visual demo or handled via context in full app.
      console.log("Toggle read status for", currentUser.name);
  };

  const handleSave = () => {
      onUpdateBook(editedBook);
      setIsEditing(false);
  };

  const handleChange = (field: keyof Book, value: any) => {
      setEditedBook(prev => ({...prev, [field]: value}));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] text-white font-display overflow-y-auto">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 h-[75vh] w-full overflow-hidden pointer-events-none">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 scale-110 blur-3xl saturate-150 transition-all duration-1000" 
            style={{backgroundImage: `url('${book.coverUrl}')`}}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 pt-6 transition-all">
        <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 active:scale-95 hover:bg-white/10 transition-all">
          <Icons.ChevronRight className="rotate-180" size={20} />
        </button>
        <div className="flex gap-2">
            {isEditing ? (
                <button onClick={handleSave} className="flex size-10 items-center justify-center rounded-full bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-400/20 active:scale-95 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                    <Icons.Save size={20} />
                </button>
            ) : (
                <button onClick={() => {
                    if(confirm("Are you sure you want to delete this book?")) onDelete();
                }} className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-red-400 border border-white/10 active:scale-95 hover:bg-red-500/20 transition-all">
                    <Icons.Delete size={20} />
                </button>
            )}
            <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 active:scale-95 hover:bg-white/10 transition-all">
                <Icons.Close size={20} />
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-5 pt-28 flex flex-col items-center animate-fade-in-up pb-32">
        
        {/* Hero Section */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="relative w-48 md:w-64 aspect-[2/3] mb-8 group perspective-1000">
            <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-[40px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
            <img 
                alt={book.title} 
                className="relative w-full h-full object-cover rounded-xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500 ring-1 ring-white/10" 
                src={book.coverUrl} 
            />
          </div>

          <div className="text-center space-y-2 mb-5 max-w-sm w-full">
            {isEditing ? (
                <>
                    <input 
                        value={editedBook.title} 
                        onChange={e => handleChange('title', e.target.value)}
                        className="w-full bg-slate-800/50 border border-white/10 rounded p-2 text-center text-xl font-bold text-white mb-2"
                        placeholder="Title"
                    />
                    <input 
                        value={editedBook.author} 
                        onChange={e => handleChange('author', e.target.value)}
                        className="w-full bg-slate-800/50 border border-white/10 rounded p-2 text-center text-md text-gray-300"
                        placeholder="Author"
                    />
                </>
            ) : (
                <>
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white drop-shadow-xl tracking-tight">{book.title}</h1>
                    <p className="text-lg text-gray-300 font-medium tracking-wide">{book.author}</p>
                </>
            )}
          </div>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm">
              <Icons.Calendar size={14} className="text-indigo-400" />
              {isEditing ? (
                  <input 
                    type="date"
                    value={editedBook.publishedDate || ''}
                    onChange={e => handleChange('publishedDate', e.target.value)}
                    className="bg-transparent border-none text-xs text-white p-0 w-24 outline-none"
                  />
              ) : (
                  book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'Unknown'
              )}
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm">
                <Icons.Tag size={14} className="text-indigo-400" />
                {book.genres[0] || 'Uncategorized'}
            </div>

            {isEditing && (
                 <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm cursor-pointer">
                    <input 
                        type="checkbox"
                        checked={editedBook.isFirstEdition}
                        onChange={e => handleChange('isFirstEdition', e.target.checked)}
                        className="rounded bg-slate-700 border-slate-600 text-indigo-500"
                    />
                    First Ed.
                 </label>
            )}
          </div>

          {/* Action Buttons */}
          {!isEditing && (
              <div className="flex items-center justify-center gap-3 w-full max-w-xs mb-4">
                <button 
                    onClick={handleToggleRead}
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all active:scale-95"
                >
                <Icons.Play size={20} fill="currentColor" />
                <span>Read</span>
                </button>
                <button 
                    onClick={onLoan}
                    className="size-12 flex items-center justify-center rounded-2xl bg-slate-800/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 font-bold shadow-lg transition-all active:scale-95"
                    title="Loan Book"
                >
                <Icons.Loan size={22} />
                </button>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="size-12 flex items-center justify-center rounded-2xl bg-slate-800/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 font-bold shadow-lg transition-all active:scale-95"
                >
                <Icons.Edit size={22} />
                </button>
            </div>
          )}
        </div>

        <div className="w-full max-w-xl space-y-4">
          
          {/* Synopsis */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 mb-3 opacity-90">
                <Icons.Magic size={16} />
                Synopsis
            </h3>
            {isEditing ? (
                <textarea 
                    value={editedBook.summary || ''}
                    onChange={e => handleChange('summary', e.target.value)}
                    className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-gray-300"
                />
            ) : (
                <p className="text-sm leading-relaxed text-gray-300">
                    {book.summary || "No summary available."}
                </p>
            )}
          </div>

          {/* Reading Activity (Read Only) */}
          {!isEditing && readers.length > 0 && (
              <div>
                <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reading Activity</h3>
                <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
                    {readers.map(reader => {
                        const entry = reader.history.find(h => h.bookId === book.id);
                        const isFinished = entry?.status === ReadStatus.COMPLETED;
                        return (
                            <div key={reader.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className="relative shrink-0">
                                    <div className="size-10 rounded-full bg-indigo-900/50 flex items-center justify-center ring-2 ring-white/10 text-xs font-bold">
                                        {reader.name.charAt(0)}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 p-[2px] rounded-full flex items-center justify-center shadow-sm ${isFinished ? 'bg-green-500 text-white' : 'bg-indigo-500 text-white'}`}>
                                        {isFinished ? <Icons.Check size={10} /> : <Icons.Book size={10} />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-white">{reader.name}</span>
                                        <span className={`text-[10px] font-bold ${isFinished ? 'text-green-400' : 'text-indigo-400'}`}>
                                            {isFinished ? 'Finished' : 'Reading'}
                                        </span>
                                    </div>
                                    {!isFinished ? (
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{width: '45%'}}></div>
                                        </div>
                                    ) : (
                                        <div className="flex text-amber-400">
                                            {[1,2,3,4,5].map(i => <Icons.Star key={i} size={10} fill="currentColor" />)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
              </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Location */}
            <div className="col-span-2 bg-slate-800/40 backdrop-blur-md border border-white/10 p-4 rounded-3xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Icons.Library size={80} className="text-white" />
                </div>
                <div className="flex items-start gap-3 relative z-10">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-indigo-400 shrink-0">
                        <Icons.Location size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Library Location</p>
                        {isEditing ? (
                            <select 
                                value={editedBook.locationId || ''}
                                onChange={e => handleChange('locationId', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white"
                            >
                                <option value="">-- Unassigned --</option>
                                {locations.map(l => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex flex-wrap items-center gap-1 text-sm font-bold text-white">
                                <span>{getLocationName(book.locationId).split('>')[0] || 'Unassigned'}</span>
                                {book.locationId && (
                                    <>
                                        <Icons.ChevronRight size={14} className="text-gray-600" />
                                        <span>{getLocationName(book.locationId).split('>').pop() || ''}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Value */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Icons.Money size={18} />
                    </div>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500">Est. Value</p>
                    {isEditing ? (
                        <input 
                            type="number"
                            value={editedBook.estimatedValue || 0}
                            onChange={e => handleChange('estimatedValue', parseFloat(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-lg font-bold text-white"
                        />
                    ) : (
                        <p className="text-lg font-bold text-white">${book.estimatedValue || 0}</p>
                    )}
                </div>
            </div>

            {/* Collector Info */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Icons.Star size={18} />
                    </div>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Collector</p>
                    {isEditing ? (
                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={editedBook.isSigned} onChange={e => handleChange('isSigned', e.target.checked)} className="rounded bg-slate-700 border-slate-600 text-indigo-500" />
                                Signed
                             </label>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {book.isFirstEdition && (
                                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_currentColor]"></span> 1st Edition
                                </span>
                            )}
                            {book.isSigned && (
                                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_currentColor]"></span> Signed
                                </span>
                            )}
                            {!book.isFirstEdition && !book.isSigned && <span className="text-[11px] text-gray-500">Standard Copy</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* Condition Report */}
            <div className={`col-span-2 bg-slate-800/40 backdrop-blur-md border border-white/10 p-4 rounded-3xl border-l-4 flex gap-4 items-start ${book.condition === BookCondition.DAMAGED ? 'border-l-red-500/80 bg-gradient-to-r from-red-500/5' : 'border-l-orange-500/80 bg-gradient-to-r from-orange-500/5'} to-transparent`}>
                <div className={`shrink-0 pt-0.5 ${book.condition === BookCondition.DAMAGED ? 'text-red-400' : 'text-orange-400'}`}>
                    <Icons.Alert size={20} />
                </div>
                <div className="space-y-1 w-full">
                    <p className={`text-xs font-bold uppercase ${book.condition === BookCondition.DAMAGED ? 'text-red-200' : 'text-orange-200'}`}>Condition Report</p>
                    {isEditing ? (
                         <select 
                            value={editedBook.condition}
                            onChange={e => handleChange('condition', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white mt-1"
                         >
                             {Object.values(BookCondition).map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                    ) : (
                        <p className="text-xs leading-relaxed text-gray-400">
                            Overall <span className="text-white font-bold">{book.condition}</span> condition. 
                        </p>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar (Edit Toggle) */}
      {!isEditing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <button className="size-11 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Icons.Users size={20} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 h-11 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-sm transition-colors shadow-lg"
            >
                <Icons.Edit size={18} />
                <span>Edit Details</span>
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button className="size-11 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Icons.Scan size={20} />
            </button>
        </div>
      )}
    </div>
  );
};