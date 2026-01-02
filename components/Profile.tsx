import React, { useState, useEffect } from 'react';
import { AppState, User, AiRecommendation, Book, ReadStatus, Persona } from '../types';
import { getRecommendations, generatePersonas } from '../services/geminiService';
import { loadState } from '../services/storageService';
import { Icons } from './Icons';

interface ProfileProps {
  user: User;
  allBooks: Book[];
  onUpdateUser: (u: User) => void;
}

interface RecCardProps {
  rec: AiRecommendation;
}

const RecCard: React.FC<RecCardProps> = ({ rec }) => (
  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col h-full hover:border-indigo-500 transition-colors">
    <div className="flex-1">
      <h4 className="font-bold text-white text-lg leading-tight">{rec.title}</h4>
      <p className="text-indigo-400 text-sm mb-2">{rec.author}</p>
      <p className="text-slate-400 text-sm italic">"{rec.reason}"</p>
    </div>
    {rec.type === 'BUY_NEXT' && (
       <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center text-xs text-slate-500">
          <span>External Recommendation</span>
          <Icons.Money size={14} className="text-green-500" />
       </div>
    )}
  </div>
);

const PersonaCard: React.FC<{ persona: Persona }> = ({ persona }) => (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-4 rounded-xl border border-indigo-500/50 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-50"><Icons.Magic size={32} /></div>
        <div className="relative z-10">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">{persona.universe}</h4>
            <h3 className="text-xl font-bold text-white mb-2">You are {persona.character}</h3>
            <p className="text-sm text-indigo-100/80">{persona.reason}</p>
        </div>
    </div>
);

export const Profile: React.FC<ProfileProps> = ({ user, allBooks, onUpdateUser }) => {
  const [readNextRecs, setReadNextRecs] = useState<AiRecommendation[]>([]);
  const [buyNextRecs, setBuyNextRecs] = useState<AiRecommendation[]>([]);
  const [loadingRead, setLoadingRead] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(false);

  const completedBooks = user.history.filter(h => h.status === ReadStatus.COMPLETED);
  const readingBooks = user.history.filter(h => h.status === ReadStatus.READING);
  const settings = loadState().aiSettings;

  useEffect(() => {
    if (readNextRecs.length === 0 && completedBooks.length > 0) fetchReadNext();
    if (buyNextRecs.length === 0 && completedBooks.length > 0) fetchBuyNext();
    if ((!user.personas || user.personas.length === 0) && completedBooks.length > 0) fetchPersonas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const fetchReadNext = async () => {
    setLoadingRead(true);
    const recs = await getRecommendations(user, allBooks, 'READ_NEXT', settings);
    setReadNextRecs(recs);
    setLoadingRead(false);
  };

  const fetchBuyNext = async () => {
    setLoadingBuy(true);
    const recs = await getRecommendations(user, allBooks, 'BUY_NEXT', settings);
    setBuyNextRecs(recs);
    setLoadingBuy(false);
  };

  const fetchPersonas = async () => {
      setLoadingPersonas(true);
      const personas = await generatePersonas(user, allBooks, settings);
      onUpdateUser({ ...user, personas });
      setLoadingPersonas(false);
  };

  return (
    <div className="p-6 space-y-12 pb-24">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-white">{user.name}</h1>
          <p className="text-slate-400">{user.role}</p>
          <div className="flex flex-wrap gap-6 mt-3 text-slate-400 text-sm justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <Icons.Book size={16} className="text-indigo-400" />
              <span>{completedBooks.length} Read</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Star size={16} className="text-yellow-400" />
              <span>{user.favorites.length} Favorites</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personas */}
      {completedBooks.length > 2 && (
          <section>
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Icons.User size={20} className="text-purple-400" />
                      Your Literary Personas
                  </h2>
                  <button onClick={fetchPersonas} disabled={loadingPersonas} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      <Icons.Magic size={14} /> Refresh
                  </button>
              </div>
              
              {loadingPersonas ? (
                  <div className="animate-pulse flex gap-4">
                      <div className="w-full h-32 bg-slate-800 rounded-xl"></div>
                      <div className="w-full h-32 bg-slate-800 rounded-xl"></div>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {user.personas?.map((p, i) => <PersonaCard key={i} persona={p} />)}
                      {(!user.personas || user.personas.length === 0) && (
                          <div className="col-span-full text-center py-8 text-slate-500">Read more books to discover your persona!</div>
                      )}
                  </div>
              )}
          </section>
      )}

      {/* Recently Read Tray */}
      {completedBooks.length > 0 && (
          <section>
              <h2 className="text-xl font-bold text-white mb-4">Recently Read</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {completedBooks.sort((a,b) => new Date(b.dateFinished || 0).getTime() - new Date(a.dateFinished || 0).getTime()).slice(0, 5).map(h => {
                      const book = allBooks.find(b => b.id === h.bookId);
                      if (!book) return null;
                      return (
                          <div key={h.bookId} className="shrink-0 w-32 group relative cursor-pointer">
                              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 shadow-lg relative">
                                  {book.coverUrl && <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="text-center p-2">
                                          <div className="text-2xl font-bold text-white">{h.rating}★</div>
                                          <div className="text-[10px] text-slate-300">Read {h.readCount || 1}x</div>
                                      </div>
                                  </div>
                              </div>
                              <p className="text-xs font-bold text-white mt-2 truncate">{book.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{new Date(h.dateFinished || '').toLocaleDateString()}</p>
                          </div>
                      );
                  })}
              </div>
          </section>
      )}

      {/* Read Next AI */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.Library size={20} className="text-blue-400" />
            Read Next from Library
          </h2>
          <button 
            onClick={fetchReadNext} 
            disabled={loadingRead}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white flex gap-1 items-center"
          >
            {loadingRead ? 'Thinking...' : 'Refresh AI'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {readNextRecs.map((rec, i) => <RecCard key={i} rec={rec} />)}
          {readNextRecs.length === 0 && !loadingRead && (
             <div className="col-span-full text-center text-slate-500 py-8 border border-dashed border-slate-700 rounded-lg">
               No suggestions yet. Read more books or refresh!
             </div>
          )}
        </div>
      </section>
    </div>
  );
};
