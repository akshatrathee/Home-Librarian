import React, { useState, useRef } from 'react';
import { Location } from '../types';
import { generateId } from '../services/storageService';
import { Icons } from './Icons';

interface LocationManagerProps {
  locations: Location[];
  onAddLocation: (loc: Location) => void;
  onUpdateLocation: (loc: Location) => void;
  onClose: () => void;
}

export const LocationManager: React.FC<LocationManagerProps> = ({ locations, onAddLocation, onUpdateLocation, onClose }) => {
  const [newLoc, setNewLoc] = useState({ name: '', type: 'Shelf', parentId: '' });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleExpand = (id: string) => setExpanded(p => ({...p, [id]: !p[id]}));

  const handleAdd = () => {
    if (!newLoc.name) return;
    onAddLocation({
      id: generateId(),
      name: newLoc.name,
      type: newLoc.type,
      parentId: newLoc.parentId || undefined
    });
    setNewLoc({ ...newLoc, name: '' });
  };

  const handleImageUpload = (locId: string, file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const loc = locations.find(l => l.id === locId);
          if (loc) {
              onUpdateLocation({ ...loc, imageUrl: reader.result as string });
          }
      };
      reader.readAsDataURL(file);
  };

  // Recursive renderer for location tree
  const renderLocationTree = (parentId?: string, depth = 0) => {
      const children = locations.filter(l => l.parentId === parentId);
      if (children.length === 0) return null;

      return (
          <div className={`flex flex-col gap-2 ${depth > 0 ? 'ml-6 border-l border-slate-700 pl-4' : ''}`}>
              {children.map(loc => (
                  <div key={loc.id}>
                      <div className="flex items-center gap-3 p-2 bg-slate-800 rounded hover:bg-slate-700 group">
                          <button onClick={() => toggleExpand(loc.id)} className="text-slate-400 hover:text-white">
                              {expanded[loc.id] ? <Icons.ChevronDown size={16} /> : <Icons.ChevronRight size={16} />}
                          </button>
                          
                          {/* Image Thumbnail */}
                          <div className="w-8 h-8 rounded bg-slate-900 overflow-hidden relative group-image">
                              {loc.imageUrl ? (
                                  <img src={loc.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                                      <Icons.Location size={12} />
                                  </div>
                              )}
                              <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-image-hover:opacity-100 cursor-pointer">
                                  <Icons.Plus size={12} className="text-white" />
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(loc.id, e.target.files[0])} />
                              </label>
                          </div>

                          <div className="flex-1">
                              <span className="text-sm font-medium text-white">{loc.name}</span>
                              <span className="text-xs text-slate-500 ml-2 uppercase tracking-wide">{loc.type}</span>
                          </div>

                          <button 
                            onClick={() => setNewLoc({...newLoc, parentId: loc.id})} 
                            className="text-xs text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100"
                          >
                              + Add Child
                          </button>
                      </div>
                      {expanded[loc.id] && renderLocationTree(loc.id, depth + 1)}
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-slate-700 shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
           <h2 className="text-xl font-bold text-white">Manage Locations</h2>
           <button onClick={onClose}><Icons.Close /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {renderLocationTree(undefined)}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950 rounded-b-xl">
             <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase">Add New Location</h3>
             <div className="flex gap-2 mb-2">
                 {newLoc.parentId && (
                     <div className="bg-indigo-900/50 text-indigo-200 px-3 py-2 rounded text-sm flex items-center gap-2">
                         Inside: {locations.find(l => l.id === newLoc.parentId)?.name}
                         <button onClick={() => setNewLoc({...newLoc, parentId: ''})}><Icons.Close size={14}/></button>
                     </div>
                 )}
             </div>
             <div className="flex flex-col sm:flex-row gap-3">
                 <input 
                    placeholder="Location Name" 
                    value={newLoc.name}
                    onChange={e => setNewLoc({...newLoc, name: e.target.value})}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                 />
                 <select 
                    value={newLoc.type}
                    onChange={e => setNewLoc({...newLoc, type: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                 >
                     <option value="Room">Room</option>
                     <option value="Shelf">Shelf</option>
                     <option value="Box">Box</option>
                     <option value="Stack">Stack</option>
                 </select>
                 <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium">Add</button>
             </div>
        </div>
      </div>
    </div>
  );
};
