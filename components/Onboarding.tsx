import React, { useState } from 'react';
import { Icons } from './Icons';
import { User, Location, DbSettings, ParentRole, EducationLevel, Book, BookCondition } from '../types';
import { generateId, calculateAge, STARTER_BOOKS } from '../services/storageService';

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

const COMMON_PROFESSIONS = [
    "Engineer", "Software Developer", "Teacher", "Doctor", "Nurse", "Artist", 
    "Writer", "Designer", "Manager", "Accountant", "Lawyer", "Architect", 
    "Scientist", "Researcher", "Student", "Homemaker", "Retired", "Entrepreneur",
    "Chef", "Pilot", "Police Officer", "Firefighter", "Musician"
];

const UserForm = ({ role, title, onSave }: { role: 'Admin' | 'User', title: string, onSave: (u: Partial<User>) => void }) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState<'Male'|'Female'|'Other'>('Male');
    
    // New Fields
    const [parentRole, setParentRole] = useState<ParentRole>('Dad');
    const [educationLevel, setEducationLevel] = useState<EducationLevel>('Undergraduate');
    const [profession, setProfession] = useState('');
    const [grade, setGrade] = useState('');

    const todayStr = new Date().toISOString().split('T')[0];

    const handleSave = () => {
        if(!name || !dob) return;
        
        // Strict Future Date Validation
        const selectedDate = new Date(dob);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        if (selectedDate > todayDate) {
            alert("Date of birth cannot be in the future.");
            return;
        }

        // 1. STRICT AGE VALIDATION FOR ADMINS
        if (role === 'Admin') {
            const age = calculateAge(dob);
            if (age < 18) {
                alert("Age Restriction: Parents/Admins must be at least 18 years old.");
                return;
            }
        }

        const u: Partial<User> = { name, dob, gender, role };
        
        if (role === 'Admin') {
            u.parentRole = parentRole;
            u.educationLevel = educationLevel;
            u.profession = profession;
        } else {
            u.educationLevel = 'Elementary'; // Default for kid
            u.profession = grade; // Use profession field for grade manually entered if needed
        }
        
        onSave(u);
        setName(''); setDob(''); setProfession(''); setGrade('');
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-4">
            <h3 className="font-bold text-white mb-3">{title}</h3>
            <div className="space-y-3">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white" />
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-[10px] text-slate-400 block mb-1">Date of Birth</label>
                        <input 
                            type="date" 
                            max={todayStr}
                            value={dob} 
                            onChange={e => setDob(e.target.value)} 
                            className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white" 
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] text-slate-400 block mb-1">Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {role === 'Admin' ? (
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] text-slate-400 block mb-1">Role</label>
                            <select value={parentRole} onChange={e => setParentRole(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white">
                                <option value="Dad">Dad</option>
                                <option value="Mom">Mom</option>
                                <option value="Guardian">Guardian</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                         <div className="flex-1">
                            <label className="text-[10px] text-slate-400 block mb-1">Education</label>
                            <select value={educationLevel} onChange={e => setEducationLevel(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white">
                                <option value="High School">High School</option>
                                <option value="Undergraduate">Undergraduate</option>
                                <option value="Postgraduate">Postgraduate</option>
                                <option value="Doctorate">Doctorate</option>
                                <option value="Self-Taught">Self-Taught</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1">
                         <label className="text-[10px] text-slate-400 block mb-1">Current Grade (Optional)</label>
                         <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. 5th Grade" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white" />
                    </div>
                )}
                
                {role === 'Admin' && (
                     <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Profession</label>
                        <input 
                            list="professions-list"
                            value={profession} 
                            onChange={e => setProfession(e.target.value)} 
                            placeholder="Start typing to select or add new..." 
                            className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white" 
                        />
                        <datalist id="professions-list">
                            {COMMON_PROFESSIONS.map(p => <option key={p} value={p} />)}
                        </datalist>
                     </div>
                )}

                <button onClick={handleSave} disabled={!name || !dob} className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-bold text-sm disabled:opacity-50">Add Person</button>
            </div>
        </div>
    );
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    
    // DB
    const [dbType, setDbType] = useState<'sqlite'|'postgres'>('sqlite');
    const [dbHost, setDbHost] = useState('localhost');
    const [dbUser, setDbUser] = useState('');
    const [dbPass, setDbPass] = useState('');
    const [dbName, setDbName] = useState('bibliopi');

    // AI
    const [aiProvider, setAiProvider] = useState<'gemini'|'ollama'>('gemini');
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    const [ollamaModel, setOllamaModel] = useState('llama3');

    // Family
    const [family, setFamily] = useState<User[]>([]);
    
    // Locations
    const [rooms, setRooms] = useState<string[]>(['Living Room', 'Bedroom']);
    const [newRoom, setNewRoom] = useState('');

    const handleAddUser = (u: Partial<User>) => {
        const newUser: User = {
            id: generateId(),
            name: u.name!,
            email: '',
            dob: u.dob!,
            gender: u.gender as any,
            educationLevel: u.educationLevel || 'Elementary',
            profession: u.profession,
            parentRole: u.parentRole,
            avatarSeed: u.name!,
            role: u.role as any,
            history: [],
            favorites: []
        };
        setFamily([...family, newUser]);
    };

    const handleComplete = () => {
        // Create Locations
        const locs: Location[] = rooms.map(name => ({
            id: generateId(),
            name: name,
            type: 'Room'
        }));
        // Create default shelf in first room
        if(locs.length > 0) locs.push({ id: generateId(), name: 'Main Shelf', type: 'Shelf', parentId: locs[0].id });

        // 4. PREPARE STARTER BOOKS
        // Assign books to the first Admin and spread them across created rooms
        const adminUser = family.find(u => u.role === 'Admin');
        const finalBooks: Book[] = STARTER_BOOKS.map((b, i) => ({
            ...b,
            id: generateId(),
            addedByUserId: adminUser ? adminUser.id : 'system',
            addedDate: new Date().toISOString(),
            condition: BookCondition.GOOD,
            isFirstEdition: false,
            isSigned: false,
            // Round robin assign to locations if available
            locationId: locs.length > 0 ? locs[i % locs.length].id : undefined
        } as Book));

        onComplete({ 
            aiProvider, 
            ollamaUrl, 
            ollamaModel, 
            users: family, 
            rooms: locs,
            dbSettings: { type: dbType, host: dbHost, user: dbUser, password: dbPass, name: dbName },
            starterBooks: finalBooks
        });
    };

    const steps = [
        { title: "Database & Backend", icon: Icons.Database },
        { title: "AI Setup", icon: Icons.Server },
        { title: "Admin & Partner", icon: Icons.User },
        { title: "Children", icon: Icons.Child },
        { title: "Library Spaces", icon: Icons.Location }
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
            <div className="max-w-2xl w-full">
                <div className="mb-8 text-center">
                    <Icons.Book size={48} className="mx-auto text-indigo-500 mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Home Librarian</h1>
                    <p className="text-slate-400">Production Setup Wizard</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    {/* Stepper */}
                    <div className="flex justify-between mb-8 border-b border-slate-800 pb-4">
                        {steps.map((s, i) => (
                            <div key={i} className={`flex flex-col items-center gap-2 ${i === step ? 'text-indigo-400' : 'text-slate-600'}`}>
                                <s.icon size={20} />
                                <span className="text-[10px] uppercase font-bold hidden sm:block">{s.title}</span>
                            </div>
                        ))}
                    </div>

                    {step === 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Database Configuration</h2>
                            <p className="text-slate-400 text-sm mb-6">Choose a lightweight database for your Raspberry Pi.</p>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <button onClick={() => setDbType('sqlite')} className={`flex-1 p-4 rounded-xl border ${dbType === 'sqlite' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>SQLite (Recommended)</button>
                                    <button onClick={() => setDbType('postgres')} className={`flex-1 p-4 rounded-xl border ${dbType === 'postgres' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>PostgreSQL</button>
                                </div>
                                {dbType === 'postgres' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <input value={dbHost} onChange={e => setDbHost(e.target.value)} placeholder="Host" className="bg-slate-950 border border-slate-800 p-3 rounded" />
                                        <input value={dbUser} onChange={e => setDbUser(e.target.value)} placeholder="User" className="bg-slate-950 border border-slate-800 p-3 rounded" />
                                        <input type="password" value={dbPass} onChange={e => setDbPass(e.target.value)} placeholder="Password" className="bg-slate-950 border border-slate-800 p-3 rounded col-span-2" />
                                        <input value={dbName} onChange={e => setDbName(e.target.value)} placeholder="DB Name" className="bg-slate-950 border border-slate-800 p-3 rounded col-span-2" />
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setStep(1)} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold">Next</button>
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">AI Brain</h2>
                            <div className="flex gap-4 mb-6">
                                <button onClick={() => setAiProvider('gemini')} className={`flex-1 p-4 rounded-xl border ${aiProvider === 'gemini' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Gemini (Free Cloud)</button>
                                <button onClick={() => setAiProvider('ollama')} className={`flex-1 p-4 rounded-xl border ${aiProvider === 'ollama' ? 'bg-orange-600/20 border-orange-500 text-orange-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Ollama (Local)</button>
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold">Next</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Parents / Admins</h2>
                            <p className="text-slate-400 text-sm mb-4">Add the primary administrators (Parents).</p>
                            
                            <UserForm role="Admin" title="Add Parent" onSave={handleAddUser} />

                            <div className="mt-4 space-y-2">
                                {family.filter(u => u.role === 'Admin').map(u => (
                                    <div key={u.id} className="flex justify-between items-center bg-slate-800 p-2 px-4 rounded">
                                        <span>{u.name} <span className="text-slate-500 text-xs">({u.role} - {u.parentRole})</span></span>
                                        <span className="text-xs text-indigo-400">{calculateAge(u.dob)} y/o</span>
                                    </div>
                                ))}
                            </div>
                            
                            <button onClick={() => setStep(3)} disabled={family.filter(u => u.role === 'Admin').length === 0} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold disabled:opacity-50">Next</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Children</h2>
                            <p className="text-slate-400 text-sm mb-4">Add profiles for kids to track reading growth.</p>
                            
                            <UserForm role="User" title="Add Child" onSave={handleAddUser} />

                            <div className="mt-4 space-y-2">
                                {family.filter(u => u.role === 'User').map(u => (
                                    <div key={u.id} className="flex justify-between items-center bg-slate-800 p-2 px-4 rounded">
                                        <span>{u.name} <span className="text-slate-500 text-xs">({u.role})</span></span>
                                        <span className="text-xs text-indigo-400">{calculateAge(u.dob)} y/o</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={() => setStep(2)} className="flex-1 bg-slate-800 py-3 rounded-xl">Back</button>
                                <button onClick={() => setStep(4)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold">Next</button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Rooms</h2>
                            <div className="flex gap-2 mb-4">
                                <input value={newRoom} onChange={e => setNewRoom(e.target.value)} placeholder="New Room Name" className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded" />
                                <button onClick={() => {if(newRoom) { setRooms([...rooms, newRoom]); setNewRoom(''); }}} className="bg-indigo-600 px-4 rounded"><Icons.Plus /></button>
                            </div>
                            <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                                {rooms.map((r, i) => (
                                    <div key={i} className="bg-slate-800 p-2 rounded flex justify-between items-center px-4">
                                        <span>{r}</span>
                                        <button onClick={() => setRooms(rooms.filter((_, idx) => idx !== i))} className="text-red-400"><Icons.Close size={14} /></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold">Finish & Initialize</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};