import React from 'react';
import { AppState, Book, Loan } from '../types';
import { Icons } from './Icons';

interface LoansManagerProps {
    state: AppState;
    onUpdateState: (s: AppState) => void;
}

export const LoansManager: React.FC<LoansManagerProps> = ({ state, onUpdateState }) => {
    const { loans, books } = state;

    const isOverdue = (loan: Loan) => {
        if (loan.returnDate) return false;
        const diff = Date.now() - new Date(loan.loanDate).getTime();
        const days = diff / (1000 * 3600 * 24);
        return days > 30; // 30 Day limit default
    };

    // Separate Overdue from Active from History
    const overdueLoans = loans.filter(l => isOverdue(l));
    const activeLoans = loans.filter(l => !l.returnDate && !isOverdue(l));
    const historyLoans = loans.filter(l => l.returnDate).sort((a,b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime());

    const handleReturn = (loanId: string) => {
        if (confirm("Mark this book as returned?")) {
            const updatedLoans = loans.map(l => 
                l.id === loanId ? { ...l, returnDate: new Date().toISOString() } : l
            );
            onUpdateState({ ...state, loans: updatedLoans });
        }
    };

    const LoanCard = ({ loan, overdue = false, history = false }: { loan: Loan, overdue?: boolean, history?: boolean }) => {
        const book = books.find(b => b.id === loan.bookId);
        if (!book) return null;

        const daysOut = Math.floor((Date.now() - new Date(loan.loanDate).getTime()) / (1000 * 3600 * 24));

        return (
            <div className={`bg-slate-800 rounded-xl overflow-hidden border relative group shadow-sm hover:shadow-lg transition-all ${overdue ? 'border-red-500 bg-red-900/10' : history ? 'border-slate-700 opacity-60' : 'border-emerald-500/50'}`}>
                <div className="flex h-32">
                    {/* Cover Slice */}
                    <div className="w-24 bg-slate-900 relative shrink-0">
                        {book.coverUrl ? (
                            <img src={book.coverUrl} className="w-full h-full object-cover opacity-80" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Icons.Book size={24} className="text-slate-600" />
                            </div>
                        )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-white leading-tight mb-1 line-clamp-1">{book.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Icons.User size={14} className={overdue ? "text-red-400" : "text-emerald-400"} />
                                <span className="font-semibold">{loan.borrowerName}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className={`flex items-center gap-2 text-xs ${overdue ? 'text-red-300 font-bold' : 'text-slate-500'}`}>
                                <Icons.Calendar size={12} />
                                <span>{overdue ? `${daysOut} Days Out` : `Out: ${new Date(loan.loanDate).toLocaleDateString()}`}</span>
                            </div>
                            {history && (
                                <div className="flex items-center gap-2 text-xs text-emerald-400">
                                <Icons.Check size={12} />
                                <span>Returned: {new Date(loan.returnDate!).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {!history && (
                    <div className="absolute right-4 bottom-4">
                        <button 
                        onClick={() => handleReturn(loan.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg transition-transform hover:scale-105 ${overdue ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                        >
                            <Icons.Check size={12} /> Return
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 h-full flex flex-col animate-fade-in pb-24">
             <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Icons.Loan className="text-emerald-500" />
                        Loan Management
                    </h1>
                    <p className="text-slate-400">Track books lent to friends and family.</p>
                </div>
            </header>

            <div className="space-y-8 overflow-y-auto">
                {/* Overdue Section */}
                {overdueLoans.length > 0 && (
                    <section className="bg-red-950/30 border border-red-900/50 p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-red-200 mb-4 flex items-center gap-2 animate-pulse">
                            <Icons.AlertTriangle /> Overdue Items
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {overdueLoans.map(l => <LoanCard key={l.id} loan={l} overdue={true} />)}
                        </div>
                    </section>
                )}

                {/* Active Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Icons.Loan className="text-emerald-400" /> Active Loans
                    </h2>
                    {activeLoans.length === 0 ? (
                        <div className="text-slate-500 text-sm italic py-4">No active loans right now.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeLoans.map(l => <LoanCard key={l.id} loan={l} />)}
                        </div>
                    )}
                </section>

                {/* History Section */}
                {historyLoans.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-slate-400 mb-4 flex items-center gap-2">
                             History
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                            {historyLoans.map(l => <LoanCard key={l.id} loan={l} history={true} />)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};