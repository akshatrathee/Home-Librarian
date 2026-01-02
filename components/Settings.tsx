import React, { useState } from 'react';
import { AppState, BackupSettings, DbSettings, AiSettings, User } from '../types';
import { Icons } from './Icons';

interface SettingsProps {
    state: AppState;
    onUpdateState: (s: Partial<AppState>) => void;
    onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ state, onUpdateState, onClose }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'backup' | 'db' | 'about'>('general');
    
    // Local state for forms
    const [aiSettings, setAiSettings] = useState<AiSettings>(state.aiSettings);
    const [dbSettings, setDbSettings] = useState<DbSettings>(state.dbSettings);
    const [backupSettings, setBackupSettings] = useState<BackupSettings>(state.backupSettings);

    const handleSave = () => {
        // Merge updates
        const updatedState = {
            ...state,
            aiSettings,
            dbSettings,
            backupSettings
        };
        // In a real app, this would trigger backend saves
        onUpdateState(updatedState);
        onClose();
    };

    const handleGoogleConnect = () => {
        // Simulate OAuth
        setTimeout(() => {
            setBackupSettings(prev => ({ 
                ...prev, 
                googleDriveConnected: true, 
                googleDriveUser: 'user@gmail.com' 
            }));
        }, 1500);
    };

    const TabButton = ({ id, icon: Icon, label }: any) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${activeTab === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl border border-slate-700 flex overflow-hidden shadow-2xl">
                
                {/* Sidebar */}
                <div className="w-64 bg-slate-950 p-6 border-r border-slate-800 flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-white mb-6 px-2">Settings</h2>
                    <TabButton id="general" icon={Icons.Settings} label="General" />
                    <TabButton id="ai" icon={Icons.Server} label="AI Configuration" />
                    <TabButton id="db" icon={Icons.Database} label="Database" />
                    <TabButton id="backup" icon={Icons.Save} label="Backup & Network" />
                    <div className="mt-auto pt-4 border-t border-slate-800">
                        <TabButton id="about" icon={Icons.Info} label="About & Credits" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col bg-slate-900">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white capitalize">{activeTab} Settings</h3>
                        <button onClick={onClose}><Icons.Close /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                                    <h4 className="font-bold text-white mb-2">Theme</h4>
                                    <div className="flex gap-4">
                                        <button onClick={() => onUpdateState({ ...state, theme: 'light' })} className={`flex-1 p-3 rounded border ${state.theme === 'light' ? 'bg-white text-slate-900 border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-700'}`}>Light Mode</button>
                                        <button onClick={() => onUpdateState({ ...state, theme: 'dark' })} className={`flex-1 p-3 rounded border ${state.theme === 'dark' ? 'bg-slate-800 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-700'}`}>Dark Mode</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Provider</label>
                                    <select 
                                        value={aiSettings.provider}
                                        onChange={e => setAiSettings({...aiSettings, provider: e.target.value as any})}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white"
                                    >
                                        <option value="gemini">Google Gemini (Cloud)</option>
                                        <option value="ollama">Ollama (Local)</option>
                                    </select>
                                </div>
                                {aiSettings.provider === 'ollama' && (
                                    <>
                                        <input 
                                            value={aiSettings.ollamaUrl}
                                            onChange={e => setAiSettings({...aiSettings, ollamaUrl: e.target.value})}
                                            placeholder="Ollama URL (e.g. http://localhost:11434)"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white"
                                        />
                                        <input 
                                            value={aiSettings.ollamaModel}
                                            onChange={e => setAiSettings({...aiSettings, ollamaModel: e.target.value})}
                                            placeholder="Model Name (e.g. llama3)"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white"
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'db' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Database Type</label>
                                    <select 
                                        value={dbSettings.type}
                                        onChange={e => setDbSettings({...dbSettings, type: e.target.value as any})}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white"
                                    >
                                        <option value="sqlite">SQLite (Simple)</option>
                                        <option value="postgres">PostgreSQL (Advanced)</option>
                                    </select>
                                </div>
                                {dbSettings.type === 'postgres' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <input value={dbSettings.host} onChange={e => setDbSettings({...dbSettings, host: e.target.value})} placeholder="Host" className="bg-slate-950 border border-slate-700 p-3 rounded text-white" />
                                        <input value={dbSettings.user} onChange={e => setDbSettings({...dbSettings, user: e.target.value})} placeholder="User" className="bg-slate-950 border border-slate-700 p-3 rounded text-white" />
                                        <input value={dbSettings.name} onChange={e => setDbSettings({...dbSettings, name: e.target.value})} placeholder="DB Name" className="bg-slate-950 border border-slate-700 p-3 rounded text-white" />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'backup' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                                    <h4 className="font-bold text-white mb-2">Google Drive</h4>
                                    {backupSettings.googleDriveConnected ? (
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Icons.Check size={16} /> Connected as {backupSettings.googleDriveUser}
                                        </div>
                                    ) : (
                                        <button onClick={handleGoogleConnect} className="bg-white text-slate-900 px-4 py-2 rounded font-bold flex items-center gap-2">
                                            <Icons.Server size={16} /> Connect Google Drive
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">NAS Path (NFS/SMB)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            value={backupSettings.nasPath || ''} 
                                            onChange={e => setBackupSettings({...backupSettings, nasPath: e.target.value})}
                                            placeholder="//192.168.1.100/backups" 
                                            className="flex-1 bg-slate-950 border border-slate-700 rounded p-3 text-white" 
                                        />
                                        <button className="bg-indigo-600 px-4 rounded text-white">Test</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                                        <Icons.Book size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Home Librarian</h3>
                                    <p className="text-slate-400">v1.0.0 (Pi Edition)</p>
                                </div>

                                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                    <h4 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">Inspirations</h4>
                                    <p className="text-slate-400 text-sm mb-4">
                                        This project was built with admiration for the open-source community. Concepts for UI layout, metadata handling, and collection management were heavily inspired by these amazing projects:
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-700 rounded text-slate-300"><Icons.Library size={16} /></div>
                                            <div>
                                                <a href="https://komga.org" target="_blank" rel="noreferrer" className="text-indigo-400 font-bold hover:underline">Komga</a>
                                                <p className="text-xs text-slate-500">Inspiration for library organization, auto-tagging, and media server structure.</p>
                                            </div>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-700 rounded text-slate-300"><Icons.Tag size={16} /></div>
                                            <div>
                                                <a href="https://koillection.github.io" target="_blank" rel="noreferrer" className="text-indigo-400 font-bold hover:underline">Koillection</a>
                                                <p className="text-xs text-slate-500">Inspiration for custom fields, loan tracking, and detailed collection management.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                                    <h4 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">Open Source Stack</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-sm">
                                            <span className="block text-slate-500 text-xs">Framework</span>
                                            <span className="text-white">React 18 + Vite</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="block text-slate-500 text-xs">Styling</span>
                                            <span className="text-white">Tailwind CSS</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="block text-slate-500 text-xs">Icons</span>
                                            <span className="text-white">Lucide React</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="block text-slate-500 text-xs">Charts</span>
                                            <span className="text-white">Recharts</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="block text-slate-500 text-xs">AI Models</span>
                                            <span className="text-white">Google Gemini & Ollama</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="block text-slate-500 text-xs">Book API</span>
                                            <span className="text-white">OpenLibrary.org</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-3 rounded-lg text-slate-400 hover:text-white">Close</button>
                        {activeTab !== 'about' && (
                            <button onClick={handleSave} className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2">
                                <Icons.Save size={18} /> Save Changes
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};