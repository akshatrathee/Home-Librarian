import React from 'react';
import { User, Book, ReadStatus } from '../types';
import { Icons } from './Icons';

interface ProfileProps {
  user: User;
  allBooks: Book[];
  onUpdateUser: (u: User) => void;
  onSettings: () => void;
  onAddUser: () => void;
  onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, allBooks, onSettings, onAddUser, onBack }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col animate-fade-in">
      <div className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 pt-safe-top">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-white">
            <Icons.ChevronRight className="rotate-180" size={24} />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Family Profiles</h1>
          <button onClick={onSettings} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-white relative">
            <Icons.Settings size={24} />
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search className="text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            </div>
            <input className="block w-full pl-10 pr-3 py-3 rounded-xl border-none bg-white dark:bg-surface-card/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-surface-card transition-all shadow-sm" placeholder="Find a family member..." type="text"/>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Members</h2>
        </div>

        {/* Current User Card */}
        <div className="group relative bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm active:scale-[0.99] transition-all cursor-pointer hover:border-primary/50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl border-2 border-primary shadow-lg shadow-primary/20">
                    {user.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full p-1 border-2 border-white dark:border-surface-card flex items-center justify-center w-6 h-6">
                  <Icons.Child size={12} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{user.name}</h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">{user.role} • {user.educationLevel}</p>
              </div>
            </div>
            <Icons.ChevronRight className="text-slate-400 group-hover:text-primary transition-colors" />
          </div>
          
          <div className="bg-slate-50 dark:bg-black/20 rounded-lg p-3 mb-4 flex items-center gap-3 border border-slate-100 dark:border-white/5">
            <div className="w-8 h-10 bg-slate-200 dark:bg-slate-700 rounded flex-shrink-0 flex items-center justify-center">
                <Icons.Book size={12} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-primary font-bold mb-0.5">Stats</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  {user.history.length > 0 ? `${user.history.length} Books in history` : "No history yet"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 pt-2 border-t border-slate-100 dark:border-white/5">
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{user.history.filter(h => h.status === ReadStatus.COMPLETED).length}</span>
              <span className="text-xs text-slate-400 ml-1">Read</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{user.favorites.length}</span>
              <span className="text-xs text-slate-400 ml-1">Favorites</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent pt-12 pointer-events-none">
        <button 
            onClick={onAddUser}
            className="pointer-events-auto w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-background-dark text-lg font-bold h-14 rounded-2xl shadow-[0_8px_20px_-6px_rgba(19,236,200,0.5)] active:scale-[0.98] transition-all text-white"
        >
          <Icons.Plus size={24} />
          Add New Member
        </button>
      </div>
    </div>
  );
};