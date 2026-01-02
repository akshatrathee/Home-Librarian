import React from 'react';
import { AppState, Book, Loan } from '../types';
import { Icons } from './Icons';

interface LoansManagerProps {
    state: AppState;
    onUpdateState: (s: AppState) => void;
}

export const LoansManager: React.FC<LoansManagerProps> = ({ state, onUpdateState }) => {
    const { loans, books } = state;

    // Sort: Active loans first, then by date
    const sortedLoans = [...loans].sort((a, b) => {
        if (!a.returnDate && b.returnDate) return -1;
        if (a.returnDate && !b.returnDate) return 1;
        return new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime();
    });

    const activeLoansCount = loans.filter(l => !l.returnDate).length;

    const handleReturn = (loanId: string) => {
        if (confirm("Mark this book as returned?")) {
            const updatedLoans = loans.map(l => 
                l.id === loanId ? { ...l, returnDate: new Date().toISOString() } : l
            );
            onUpdateState({ ...state, loans: updatedLoans });
        }
    };

    const isOverdue = (loan: Loan) => {
        if (loan.returnDate) return false;
        const diff = Date.now() - new Date(loan.loanDate).getTime();
        const days = diff / (1000 * 3600 * 24);
        return days > 30; // 30 Day limit default
    };

    return (
        <div className="p-6 h-full flex flex-col animate-fade-in">
             <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Icons.Loan className="text-emerald-500" />
                        Loan Management
                    </h1>
                    <p className="text-slate-400">Track books lent to friends and family.</p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-2xl font-bold text-white">{activeLoansCount}</span>
                    <span className="text-xs text-slate-500 ml-2 uppercase">Active Loans</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                {sortedLoans.map(loan => {
                    const book = books.find(b => b.id === loan.bookId);
                    const overdue = isOverdue(loan);
                    
                    if (!book) return null; // Should not happen

                    return (
                        <div key={loan.id} className={`bg-slate-800 rounded-xl overflow-hidden border ${loan.returnDate ? 'border-slate-700 opacity-60' : overdue ? 'border-red-500' : 'border-emerald-500/50'} relative group`}>
                             
                             <div className="flex">
                                 {/* Cover Slice */}
                                 <div className="w-24 bg-slate-900 relative">
                                     {book.coverUrl ? (
                                         <img src={book.coverUrl} className="w-full h-full object-cover opacity-80" alt="" />
                                     ) : (
                                         <div className="w-full h-full flex items-center justify-center">
                                             <Icons.Book size={24} className="text-slate-600" />
                                         </div>
                                     )}
                                     {overdue && !loan.returnDate && (
                                         <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[10px] font-bold text-center py-1">
                                             OVERDUE
                                         </div>
                                     )}
                                 </div>

                                 <div className="p-4 flex-1 flex flex-col">
                                     <h3 className="font-bold text-white leading-tight mb-1 line-clamp-2">{book.title}</h3>
                                     <p className="text-xs text-indigo-400 mb-4">{book.author}</p>
                                     
                                     <div className="mt-auto space-y-2">
                                         <div className="flex items-center gap-2 text-sm text-slate-300">
                                             <Icons.User size={14} className="text-emerald-400" />
                                             <span className="font-semibold">{loan.borrowerName}</span>
                                         </div>
                                         <div className="flex items-center gap-2 text-xs text-slate-500">
                                             <Icons.Calendar size={12} />
                                             <span>Out: {new Date(loan.loanDate).toLocaleDateString()}</span>
                                         </div>
                                         {loan.returnDate && (
                                             <div className="flex items-center gap-2 text-xs text-emerald-400">
                                                <Icons.Check size={12} />
                                                <span>Returned: {new Date(loan.returnDate).toLocaleDateString()}</span>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>

                             {/* Actions */}
                             {!loan.returnDate && (
                                 <div className="absolute bottom-4 right-4">
                                     <button 
                                        onClick={() => handleReturn(loan.id)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg"
                                     >
                                         <Icons.Check size={12} /> Return
                                     </button>
                                 </div>
                             )}
                        </div>
                    );
                })}

                {sortedLoans.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                        <Icons.Loan size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No active history. Loan a book from the Library view!</p>
                    </div>
                )}
            </div>
        </div>
    );
};