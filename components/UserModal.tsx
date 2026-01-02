import React, { useState } from 'react';
import { User, EducationLevel, ParentRole } from '../types';
import { generateId } from '../services/storageService';
import { Icons } from './Icons';

interface UserModalProps {
    user?: User; // If present, editing mode
    onSave: (user: User) => void;
    onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<User>>(user || {
        name: '',
        dob: '',
        gender: 'Male',
        role: 'User',
        educationLevel: 'Elementary',
        history: [],
        favorites: [],
        avatarSeed: generateId() // Random seed for new user
    });

    const handleSubmit = () => {
        if (!formData.name || !formData.dob) return;
        
        const newUser: User = {
            ...formData as User,
            id: user?.id || generateId(),
            avatarSeed: formData.avatarSeed || generateId()
        };
        
        onSave(newUser);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-800 bg-slate-950">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icons.User className="text-indigo-500" /> {user ? 'Edit Profile' : 'Add Family Member'}
                    </h2>
                </div>
                
                <div className="p-6 space-y-5 overflow-y-auto">
                    <div className="flex justify-center mb-4">
                        <div className="size-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-slate-800 shadow-xl">
                            {formData.name ? formData.name.charAt(0) : <Icons.User />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Name"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                            <input 
                                type="date"
                                value={formData.dob}
                                onChange={e => setFormData({...formData, dob: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                            <select 
                                value={formData.gender}
                                onChange={e => setFormData({...formData, gender: e.target.value as any})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Education</label>
                            <select 
                                value={formData.educationLevel}
                                onChange={e => setFormData({...formData, educationLevel: e.target.value as any})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"
                            >
                                <option value="Preschool">Preschool</option>
                                <option value="Elementary">Elementary</option>
                                <option value="High School">High School</option>
                                <option value="Undergraduate">Undergraduate</option>
                                <option value="Postgraduate">Postgraduate</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                            <select 
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value as any})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"
                            >
                                <option value="User">Reader</option>
                                <option value="Admin">Admin (Parent)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-950 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-lg text-slate-400 hover:text-white font-medium hover:bg-slate-800 transition-colors">Cancel</button>
                    <button 
                        onClick={handleSubmit}
                        className="flex-1 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/20"
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
};