import React, { useState } from 'react';
import { User, Location, DbSettings, Book, BookCondition } from '../types';
import { generateId, STARTER_BOOKS } from '../services/storageService';

interface OnboardingProps {
    onComplete: (data: { 
        aiProvider: 'gemini' | 'ollama', 
        ollamaUrl: string, 
        ollamaModel: string, 
        users: User[], 
        rooms: Location[],
        dbSettings: DbSettings,
        starterBooks: Book[]
    }) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [initializing, setInitializing] = useState(false);

    const handleGetStarted = () => {
        setInitializing(true);
        setTimeout(() => {
            const adminId = generateId();
            const adminUser: User = {
                id: adminId,
                name: 'Admin User',
                dob: '1990-01-01',
                gender: 'Male',
                role: 'Admin',
                educationLevel: 'Undergraduate',
                avatarSeed: 'Admin',
                history: [],
                favorites: []
            };

            const room1: Location = { id: generateId(), name: 'Living Room', type: 'Room' };
            const books = STARTER_BOOKS.map(b => ({
                ...b,
                id: generateId(),
                addedByUserId: adminId,
                addedDate: new Date().toISOString(),
                condition: BookCondition.GOOD,
                isFirstEdition: false,
                isSigned: false,
                locationId: room1.id
            } as Book));

            onComplete({
                aiProvider: 'gemini',
                ollamaUrl: 'http://localhost:11434',
                ollamaModel: 'llama3.2',
                users: [adminUser],
                rooms: [room1],
                dbSettings: { type: 'sqlite', host: 'localhost', name: 'homelibrary' },
                starterBooks: books
            });
        }, 1500);
    };

    return (
        <div className="font-display antialiased bg-[#05070a] text-white h-[100dvh] w-full overflow-hidden selection:bg-primary selection:text-white flex flex-col">
            <div className="fixed inset-0 z-0 select-none pointer-events-none">
                <div 
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat transform scale-105 opacity-60" 
                    style={{
                        backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBdSDhquL63zzpioi-b4S5BtcTZvYnOjnJZ8LZ9N_19KuGqLe_evrbRhg-vimy3FoXpcjPsikXAcDcwTDCoCTnmjAg_bPe7J4_WWnGSK6iZ2FGTjiP90EwqSSraODq9Mhi4zGt5y6pQY5DYrwppYfMh233E5vhy-ZrNktw91dSB-Wj4yUGAcpJDit8WD7_K_rWaDtgmO17Bf7Yd0NOXZbRaT1mT3yQp-yPg_FUhTiM51JRwzVTreUcshJ5BIyJVnXAtbZs2SNMCCFYL")', 
                        filter: 'saturate(0) brightness(0.8) contrast(1.2)'
                    }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-[#05070a]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/80 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80"></div>
            </div>
            
            <div className="relative z-10 flex flex-col h-full w-full px-6 py-12 justify-between">
                <div className="w-full flex justify-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-semibold tracking-widest text-slate-300 uppercase">Pi-Library Online</span>
                    </div>
                </div>
                
                <div className="flex flex-col items-center justify-center flex-1 -mt-10 space-y-8">
                    <div className="relative group">
                        <div className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-1000"></div>
                        <div className="relative w-32 h-32 bg-gradient-to-br from-slate-900 to-black rounded-[2rem] border border-white/10 shadow-2xl flex items-center justify-center ring-1 ring-white/5 backdrop-blur-xl">
                            <span className="material-symbols-outlined text-7xl bg-gradient-to-tr from-blue-400 to-white bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(25,76,230,0.5)]">auto_stories</span>
                        </div>
                    </div>
                    <div className="text-center space-y-4 max-w-[320px]">
                        <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-xl">
                            BiblioPi
                        </h1>
                        <p className="text-lg text-slate-300 font-medium leading-relaxed drop-shadow-md">
                            Your personal AI librarian.<br/>
                            <span className="text-slate-400 font-normal">Discover, track, and read.</span>
                        </p>
                    </div>
                </div>
                
                <div className="w-full max-w-sm mx-auto flex flex-col gap-4 pb-6">
                    <button 
                        onClick={handleGetStarted}
                        disabled={initializing}
                        className="group w-full relative overflow-hidden rounded-2xl bg-primary p-[1px] shadow-[0_0_20px_rgba(25,76,230,0.3)] transition-all active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary opacity-100"></div>
                        <div className="relative flex h-14 w-full items-center justify-center rounded-2xl bg-transparent px-6 transition-all">
                            <span className="text-lg font-bold text-white tracking-wide mr-2">
                                {initializing ? 'Initializing...' : 'Get Started'}
                            </span>
                            {!initializing && <span className="material-symbols-outlined text-[24px] text-white transition-transform group-hover:translate-x-1">arrow_forward</span>}
                        </div>
                    </button>
                    <button className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Configure Server Settings
                    </button>
                </div>
            </div>
        </div>
    );
};