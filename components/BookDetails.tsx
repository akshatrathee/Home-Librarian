import React, { useState, useEffect } from 'react';
import { Book, User, Loan, Location, MediaAdaptation, BookCondition } from '../types';
import { Icons } from './Icons';

interface BookDetailsProps {
  book: Book;
  currentUser: User;
  users: User[];
  locations: Location[];
  getLocationName: (id?: string) => string;
  onClose: () => void;
  onLoan: () => void;
  onUpdateBook: (book: Book) => void;
}

export const BookDetails: React.FC<BookDetailsProps> = ({ book, currentUser, users, locations, getLocationName, onClose, onLoan, onUpdateBook }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'insights' | 'media' | 'data'>('info');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBook, setEditedBook] = useState<Book>(book);
  const [showLightbox, setShowLightbox] = useState(false);
  const [damageModalOpen, setDamageModalOpen] = useState(false);
  const [damageNote, setDamageNote] = useState('');

  // Location Selector Logic
  const currentLocation = locations.find(l => l.id === editedBook.locationId);
  const currentParentId = currentLocation?.parentId || (currentLocation?.type === 'Room' ? currentLocation.id : ''); // The Room ID
  const [selectedRoomId, setSelectedRoomId] = useState(currentParentId);
  const [selectedShelfId, setSelectedShelfId] = useState(currentLocation?.parentId ? currentLocation.id : '');

  // Sync Room/Shelf State when editing starts
  useEffect(() => {
      if(isEditing) {
          const loc = locations.find(l => l.id === editedBook.locationId);
          if (loc) {
              if (loc.parentId) {
                   setSelectedRoomId(loc.parentId);
                   setSelectedShelfId(loc.id);
              } else {
                   setSelectedRoomId(loc.id);
                   setSelectedShelfId('');
              }
          }
      }
  }, [isEditing, editedBook.locationId, locations]);

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

  const addedByUser = users.find(u => u.id === book.addedByUserId);

  // Text to Speech
  const speakSummary = () => {
    if ('speechSynthesis' in window) {
       const utterance = new SpeechSynthesisUtterance(`${book.title} by ${book.author}. ${book.summary}`);
       window.speechSynthesis.speak(utterance);
    } else {
       alert("TTS not supported in this browser.");
    }
  };

  const getEmbedUrl = (url?: string) => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const handleMediaClick = (media: MediaAdaptation) => {
      const embed = getEmbedUrl(media.youtubeLink);
      if (embed) setPlayingVideo(embed);
      else if (media.youtubeLink) window.open(media.youtubeLink, '_blank');
  };

  const copyPublicLink = () => {
      const url = `${window.location.origin}/share/${book.id}`;
      navigator.clipboard.writeText(url);
      alert("Public share link copied to clipboard!");
  };

  const handleSave = () => {
      const finalLoc = selectedShelfId || selectedRoomId;
      onUpdateBook({
          ...editedBook,
          locationId: finalLoc || undefined,
          purchasePrice: Number(editedBook.purchasePrice),
          estimatedValue: Number(editedBook.estimatedValue),
          totalPages: Number(editedBook.totalPages),
          minAge: Number(editedBook.minAge)
      });
      setIsEditing(false);
  };

  const handleReportDamage = () => {
      if (!damageNote) return;
      const updated = {
          ...editedBook,
          condition: BookCondition.DAMAGED,
          customFields: { ...editedBook.customFields, DamageNotes: damageNote }
      };
      onUpdateBook(updated);
      setEditedBook(updated);
      setDamageModalOpen(false);
      alert("Damage reported and condition updated.");
  };

  const availableRooms = locations.filter(l => l.type === 'Room' || !l.parentId);
  const availableShelves = locations.filter(l => l.parentId === selectedRoomId);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose} 
    >
      <div 
        className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-700 relative"
        onClick={e => e.stopPropagation()} 
      >
        
        {/* LIGHTBOX */}
        {showLightbox && book.coverUrl && (
            <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-8 cursor-zoom-out" onClick={() => setShowLightbox(false)}>
                <img src={book.coverUrl} className="max-w-full max-h-full rounded shadow-2xl" alt="Full cover" />
                <button className="absolute top-4 right-4 text-white bg-slate-800 p-2 rounded-full"><Icons.Close /></button>
            </div>
        )}

        {/* DAMAGE MODAL */}
        {damageModalOpen && (
            <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-6 rounded-xl border border-red-500/50 w-full max-w-md shadow-2xl">
                    <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                        <Icons.AlertTriangle /> Report Damage
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">Please describe the damage details (torn pages, water damage, broken spine, etc).</p>
                    <textarea 
                        value={damageNote} 
                        onChange={e => setDamageNote(e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white h-32 mb-4"
                        placeholder="Describe damage..."
                    />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDamageModalOpen(false)} className="px-4 py-2 rounded text-slate-400 hover:bg-slate-700">Cancel</button>
                        <button onClick={handleReportDamage} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold">Report & Mark Damaged</button>
                    </div>
                </div>
            </div>
        )}

        {/* Video Player Overlay */}
        {playingVideo && (
            <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
                 <button onClick={() => setPlayingVideo(null)} className="absolute top-4 right-4 text-white hover:text-red-500 z-30">
                     <Icons.Close size={32} />
                 </button>
                 <iframe 
                    width="100%" 
                    height="100%" 
                    src={playingVideo} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                 ></iframe>
            </div>
        )}

        {/* Sidebar Image */}
        <div className="md:w-1/3 bg-slate-950 p-6 flex flex-col items-center justify-center relative border-r border-slate-800 overflow-y-auto">
          {book.coverUrl && (
             <div className="relative group cursor-zoom-in" onClick={() => setShowLightbox(true)}>
                <img src={book.coverUrl} className="w-48 shadow-2xl rounded-lg transform group-hover:scale-105 transition-transform duration-500" alt={book.title} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                    <Icons.Scan className="text-white drop-shadow-lg" size={32} />
                </div>
             </div>
          )}
          <div className="mt-6 w-full space-y-3">
             {book.amazonLink && (
                 <a href={book.amazonLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-medium transition-colors">
                     <Icons.Rupee size={16} /> View on Amazon.in
                 </a>
             )}
             <button onClick={onLoan} className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
                 <Icons.User size={16} /> Loan to Friend
             </button>
             <button onClick={speakSummary} className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors border border-slate-700">
                 <Icons.Volume size={16} /> Read Aloud
             </button>
             <button onClick={() => setDamageModalOpen(true)} className="flex items-center justify-center gap-2 w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 py-2 rounded-lg font-medium transition-colors">
                 <Icons.AlertTriangle size={16} /> Report Damage
             </button>
          </div>
          <div className="mt-6 text-center">
             <div className="text-2xl font-bold text-white">{formatINR(book.estimatedValue || 0)}</div>
             <div className="text-xs text-slate-500 uppercase tracking-wider">Estimated Value</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 relative shrink-0">
                 <div className="absolute top-4 right-4 flex gap-2">
                     {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 text-white shadow-lg">
                            <Icons.Edit size={20} />
                        </button>
                     ) : (
                        <div className="flex gap-2 bg-slate-900 rounded-full shadow-xl">
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 text-white">
                                <Icons.Close size={20} />
                            </button>
                            <button onClick={handleSave} className="p-2 bg-green-600 rounded-full hover:bg-green-500 text-white">
                                <Icons.Save size={20} />
                            </button>
                        </div>
                     )}
                     {!isEditing && (
                        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300">
                            <Icons.Close size={20} />
                        </button>
                     )}
                 </div>
                 
                 {isEditing ? (
                     <div className="space-y-3 pr-16">
                         <input 
                            value={editedBook.title}
                            onChange={e => setEditedBook({...editedBook, title: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xl font-bold text-white"
                            placeholder="Title"
                         />
                         <input 
                            value={editedBook.author}
                            onChange={e => setEditedBook({...editedBook, author: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-lg text-indigo-400"
                            placeholder="Author"
                         />
                     </div>
                 ) : (
                    <>
                        <h2 className="text-3xl font-bold text-white mb-1 pr-12">{book.title}</h2>
                        <p className="text-xl text-indigo-400">{book.author}</p>
                    </>
                 )}
                 
                 <div className="flex gap-2 mt-4 flex-wrap items-center">
                     {book.series && !isEditing && (
                        <div className="inline-flex items-center gap-2 bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full text-sm font-bold">
                            <Icons.Library size={14} />
                            {book.series} #{book.seriesIndex}
                        </div>
                     )}
                     
                     <span className={`px-2 py-1 rounded text-xs font-bold ${book.minAge && book.minAge > 13 ? 'bg-red-900 text-red-200' : 'bg-emerald-900 text-emerald-200'}`}>
                         {book.minAge ? `${book.minAge}+ Age Rating` : 'All Ages'}
                     </span>
                     
                     {!isEditing && (
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1">
                            <Icons.Location size={10} />
                            {getLocationName(book.locationId)}
                        </span>
                     )}

                     {book.condition === BookCondition.DAMAGED && (
                         <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold flex items-center gap-1">
                             <Icons.AlertTriangle size={10} /> DAMAGED
                         </span>
                     )}
                 </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 px-6 shrink-0 overflow-x-auto">
                {['info', 'insights', 'media', 'data'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        {tab === 'info' ? 'Overview' : tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'info' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
                            {isEditing ? (
                                <textarea 
                                    value={editedBook.summary}
                                    onChange={e => setEditedBook({...editedBook, summary: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-slate-300 h-32"
                                />
                            ) : (
                                <p className="text-slate-300 leading-relaxed">{book.summary || 'No summary available.'}</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Genres & Tags</h3>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input 
                                        value={editedBook.genres.join(', ')}
                                        onChange={e => setEditedBook({...editedBook, genres: e.target.value.split(',').map(s=>s.trim())})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                                        placeholder="Genres (comma separated)"
                                    />
                                    <input 
                                        value={editedBook.tags.join(', ')}
                                        onChange={e => setEditedBook({...editedBook, tags: e.target.value.split(',').map(s=>s.trim())})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                                        placeholder="Tags (comma separated)"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {book.genres.concat(book.tags).map((t, i) => (
                                        <span key={i} className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-6">
                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                             <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                 <Icons.Book className="text-blue-400" />
                                 How to Understand This Book
                             </h3>
                             <p className="text-slate-300 leading-relaxed italic">{book.understandingGuide || "AI has not generated a guide for this book yet."}</p>
                         </div>
                         
                         <div className="bg-red-900/20 p-4 rounded-xl border border-red-900/50">
                             <h3 className="text-lg font-semibold text-red-200 mb-2 flex items-center gap-2">
                                 <Icons.AlertTriangle className="text-red-500" />
                                 Parental Advice
                             </h3>
                             <p className="text-red-100/80 leading-relaxed">{book.parentalAdvice || "No specific warnings. Suitable for general audiences."}</p>
                         </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="space-y-6">
                         <div>
                             <h3 className="text-lg font-semibold text-white mb-4">Cultural References</h3>
                             <p className="text-slate-300">{book.culturalReference || "No major cultural references found."}</p>
                         </div>

                         <div>
                             <h3 className="text-lg font-semibold text-white mb-4">Adaptations</h3>
                             {(!book.mediaAdaptations || book.mediaAdaptations.length === 0) ? (
                                 <p className="text-slate-500">No known adaptations.</p>
                             ) : (
                                 <div className="grid grid-cols-1 gap-4">
                                     {book.mediaAdaptations.map((media, i) => (
                                         <div 
                                            key={i} 
                                            onClick={() => handleMediaClick(media)}
                                            className="flex items-start gap-4 bg-slate-800 p-4 rounded-lg cursor-pointer hover:bg-slate-700 transition"
                                         >
                                             <div className="p-3 bg-indigo-900/50 rounded-lg text-indigo-300 relative">
                                                 <Icons.Film size={24} />
                                                 {media.youtubeLink && <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-0.5"><Icons.Play size={10} className="text-white"/></div>}
                                             </div>
                                             <div className="flex-1">
                                                 <h4 className="font-bold text-white">{media.title}</h4>
                                                 <p className="text-sm text-slate-400 mb-2">{media.type}</p>
                                                 {media.description && <p className="text-sm text-slate-500 mb-2">{media.description}</p>}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="space-y-6">
                         {isEditing && (
                             <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30 mb-4">
                                 <h4 className="font-bold text-indigo-300 mb-2">Location Assignment</h4>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="text-xs text-indigo-200 block mb-1">Room</label>
                                         <select 
                                            value={selectedRoomId} 
                                            onChange={e => { setSelectedRoomId(e.target.value); setSelectedShelfId(''); }} 
                                            className="w-full bg-slate-800 border border-indigo-500/50 rounded p-2 text-white"
                                         >
                                             <option value="">Unassigned</option>
                                             {availableRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                         </select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-indigo-200 block mb-1">Shelf</label>
                                         <select 
                                            value={selectedShelfId} 
                                            onChange={e => setSelectedShelfId(e.target.value)} 
                                            disabled={!selectedRoomId}
                                            className="w-full bg-slate-800 border border-indigo-500/50 rounded p-2 text-white disabled:opacity-50"
                                         >
                                             <option value="">-- Select Shelf --</option>
                                             {availableShelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                         </select>
                                     </div>
                                 </div>
                             </div>
                         )}

                         <div>
                             <h3 className="text-lg font-semibold text-white mb-4">Metadata</h3>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                 <div className="bg-slate-800 p-3 rounded">
                                     <span className="block text-slate-500 text-xs">ISBN</span>
                                     {isEditing ? (
                                         <input value={editedBook.isbn} onChange={e => setEditedBook({...editedBook, isbn: e.target.value})} className="w-full bg-slate-900 text-white rounded p-1 border border-slate-700"/>
                                     ) : <span className="text-white">{book.isbn}</span>}
                                 </div>
                                 <div className="bg-slate-800 p-3 rounded">
                                     <span className="block text-slate-500 text-xs">Publisher</span>
                                     {isEditing ? (
                                         <input value={editedBook.publisher || ''} onChange={e => setEditedBook({...editedBook, publisher: e.target.value})} className="w-full bg-slate-900 text-white rounded p-1 border border-slate-700"/>
                                     ) : <span className="text-white">{book.publisher || 'N/A'}</span>}
                                 </div>
                                 <div className="bg-slate-800 p-3 rounded">
                                     <span className="block text-slate-500 text-xs">Condition</span>
                                     {isEditing ? (
                                         <select value={editedBook.condition} onChange={e => setEditedBook({...editedBook, condition: e.target.value as any})} className="w-full bg-slate-900 text-white rounded p-1 border border-slate-700">
                                            {Object.values(BookCondition).map(c => <option key={c} value={c}>{c}</option>)}
                                         </select>
                                     ) : <span className="text-white">{book.condition}</span>}
                                 </div>
                                 <div className="bg-slate-800 p-3 rounded">
                                     <span className="block text-slate-500 text-xs">Pages</span>
                                     {isEditing ? (
                                         <input type="number" value={editedBook.totalPages || 0} onChange={e => setEditedBook({...editedBook, totalPages: parseInt(e.target.value)})} className="w-full bg-slate-900 text-white rounded p-1 border border-slate-700"/>
                                     ) : <span className="text-white">{book.totalPages || 'N/A'}</span>}
                                 </div>
                                 <div className="bg-slate-800 p-3 rounded">
                                     <span className="block text-slate-500 text-xs">Purchase Price (INR)</span>
                                     {isEditing ? (
                                         <input type="number" value={editedBook.purchasePrice || 0} onChange={e => setEditedBook({...editedBook, purchasePrice: parseInt(e.target.value)})} className="w-full bg-slate-900 text-white rounded p-1 border border-slate-700"/>
                                     ) : <span className="text-white">{formatINR(book.purchasePrice || 0)}</span>}
                                 </div>
                                 <div className="bg-slate-800 p-3 rounded">
                                     <span className="block text-slate-500 text-xs">Est. Value (INR)</span>
                                     {isEditing ? (
                                         <input type="number" value={editedBook.estimatedValue || 0} onChange={e => setEditedBook({...editedBook, estimatedValue: parseInt(e.target.value)})} className="w-full bg-slate-900 text-white rounded p-1 border border-slate-700"/>
                                     ) : <span className="text-white">{formatINR(book.estimatedValue || 0)}</span>}
                                 </div>
                             </div>
                         </div>
                         
                         {book.customFields && book.customFields['DamageNotes'] && (
                             <div className="p-4 bg-red-900/10 border border-red-900/40 rounded text-red-200">
                                 <h4 className="font-bold mb-2">Damage Report</h4>
                                 <p className="text-sm italic">"{book.customFields['DamageNotes']}"</p>
                             </div>
                         )}
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};