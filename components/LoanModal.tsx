import React, { useState } from 'react';
import { Book, User, Loan } from '../types';
import { generateId } from '../services/storageService';
import { Icons } from './Icons';

interface LoanModalProps {
    book: Book;
    users: User[];
    onConfirm: (loan: Loan) => void;
    onClose: () => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({ book, users, onConfirm, onClose }) => {
    const [borrowerName, setBorrowerName] = useState('');
    const [existingUserId, setExistingUserId] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (!borrowerName && !existingUserId) return;

        const name = existingUserId 
            ? users.find(u => u.id === existingUserId)?.name || 'Unknown'
            : borrowerName;

        const loan: Loan = {
            id: generateId(),
            bookId: book.id,
            borrowerName: name,
            loanDate: new Date().toISOString(),
            notes: notes
        };

        onConfirm(loan);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 bg-slate-950">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icons.Loan className="text-emerald-500" /> Loan Book
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Lending "{book.title}"</p>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Select Family Member</label>
                        <select 
                            value={existingUserId}
                            onChange={(e) => {
                                setExistingUserId(e.target.value);
                                setBorrowerName('');
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"
                        >
                            <option value="">-- Select --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-px bg-slate-800 flex-1"></div>
                        <span className="text-xs text-slate-500 font-bold uppercase">Or External Friend</span>
                        <div className="h-px bg-slate-800 flex-1"></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Friend's Name</label>
                        <input 
                            value={borrowerName}
                            onChange={(e) => {
                                setBorrowerName(e.target.value);
                                setExistingUserId('');
                            }}
                            disabled={!!existingUserId}
                            placeholder="e.g. John Doe"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Notes (Optional)</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Return by next week..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 min-h-[80px]"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-950 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-lg text-slate-400 hover:text-white font-medium hover:bg-slate-800 transition-colors">Cancel</button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!borrowerName && !existingUserId}
                        className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Loan
                    </button>
                </div>
            </div>
        </div>
    );
};