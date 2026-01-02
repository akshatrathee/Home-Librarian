import React, { useRef } from 'react';
import { AppState, Book, Loan, BookCondition, ReadStatus } from '../types';
import { Icons } from './Icons';
import { generateId } from '../services/storageService';

interface MaintenanceProps {
    state: AppState;
    onUpdateState: (s: AppState) => void;
}

export const Maintenance: React.FC<MaintenanceProps> = ({ state, onUpdateState }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Health Checks
    const homelessBooks = state.books.filter(b => !b.locationId);
    const overdueLoans = state.loans.filter(l => {
        if (l.returnDate) return false;
        const loanTime = new Date(l.loanDate).getTime();
        const diffDays = (Date.now() - loanTime) / (1000 * 3600 * 24);
        return diffDays > 30;
    });

    const downloadBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `home_librarian_backup_${new Date().toISOString()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            // Simple CSV parsing (Header: Title, Author, ISBN)
            const lines = text.split('\n');
            const newBooks: Book[] = [];
            
            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length >= 2) {
                    newBooks.push({
                        id: generateId(),
                        title: cols[0]?.trim() || 'Imported Book',
                        author: cols[1]?.trim() || 'Unknown',
                        isbn: cols[2]?.trim() || '',
                        genres: [],
                        tags: ['Imported'],
                        condition: BookCondition.GOOD,
                        isFirstEdition: false,
                        isSigned: false,
                        addedDate: new Date().toISOString(),
                        addedByUserId: state.currentUser || '',
                        status: ReadStatus.UNREAD
                    });
                }
            }

            if(newBooks.length > 0) {
                if(confirm(`Found ${newBooks.length} books. Import them?`)) {
                    onUpdateState({
                        ...state,
                        books: [...state.books, ...newBooks]
                    });
                    alert("Import successful!");
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-6 space-y-8 animate-fade-in pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Icons.Maintenance className="text-amber-500" />
                    Maintenance Center
                </h1>
                <p className="text-slate-400">System health, backups, and data integrity.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Backup Config */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Icons.Database className="text-blue-400" />
                        Backup Strategy
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-700">
                            <div>
                                <span className="font-bold text-white block">Local Download</span>
                                <span className="text-xs text-slate-500">JSON Dump</span>
                            </div>
                            <button onClick={downloadBackup} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                                <Icons.Save size={14} /> Download
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-700">
                             <div>
                                <span className="font-bold text-white block">Import CSV</span>
                                <span className="text-xs text-slate-500">Bulk Add Books</span>
                            </div>
                            <label className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 cursor-pointer">
                                <Icons.PlusCircle size={14} /> Import
                                <input type="file" ref={fileInputRef} onChange={handleImportCsv} accept=".csv" className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Health Check */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Icons.Alert className="text-red-400" />
                        Library Health
                    </h3>
                    
                    <div className="space-y-4">
                        {homelessBooks.length > 0 ? (
                            <div className="p-4 bg-red-900/20 border border-red-900 rounded-lg">
                                <h4 className="font-bold text-red-200 mb-1">{homelessBooks.length} Books without location</h4>
                                <p className="text-xs text-red-300 mb-2">These books need to be assigned to a room or shelf.</p>
                                <button className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded">Fix Now</button>
                            </div>
                        ) : (
                            <div className="p-3 bg-emerald-900/20 border border-emerald-900 rounded text-emerald-300 flex items-center gap-2">
                                <Icons.Check size={16} /> All books are located.
                            </div>
                        )}

                        {overdueLoans.length > 0 ? (
                            <div className="p-4 bg-amber-900/20 border border-amber-900 rounded-lg">
                                <h4 className="font-bold text-amber-200 mb-1">{overdueLoans.length} Overdue Loans</h4>
                                <ul className="text-xs text-amber-300 mb-2 list-disc list-inside">
                                    {overdueLoans.map(l => (
                                        <li key={l.id}>{l.borrowerName} (Took: {new Date(l.loanDate).toLocaleDateString()})</li>
                                    ))}
                                </ul>
                                <button className="text-xs bg-amber-800 hover:bg-amber-700 text-white px-3 py-1 rounded">Mark Returned</button>
                            </div>
                        ) : (
                             <div className="p-3 bg-emerald-900/20 border border-emerald-900 rounded text-emerald-300 flex items-center gap-2">
                                <Icons.Check size={16} /> No overdue books.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="text-center text-xs text-slate-500 pt-8">
                Database: {state.dbSettings.type.toUpperCase()} @ {state.dbSettings.host || 'local'} • AI: {state.aiSettings.provider.toUpperCase()}
            </div>
        </div>
    );
};
