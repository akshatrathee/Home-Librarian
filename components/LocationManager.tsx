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
  
  // Default expand all rooms on load if not many
  React.useEffect(() => {
      const initialExpand: Record<string, boolean> = {};
      locations.filter(l => !l.parentId).forEach(l => initialExpand[l.id] = true);
      setExpanded(initialExpand);
  }, []);

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
          <div className={`flex flex-col gap-2 ${depth > 0 ? 'ml-6 border-l-2 border-slate-700/50 pl-4' : ''}`}>
              {children.map(loc => {
                  const hasChildren = locations.some(l => l.parentId === loc.id);
                  const isRoom = loc.type === 'Room';

                  return (
                    <div key={loc.id} className="relative">
                        <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isRoom ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'} hover:border-indigo-500/50 group`}>
                            {/* Expand Toggle */}
                            <button 
                                onClick={() => toggleExpand(loc.id)} 
                                className={`text-slate-400 hover:text-white transition-transform ${hasChildren ? '' : 'invisible'} ${expanded[loc.id] ? 'rotate-90' : ''}`}
                            >
                                <Icons.ChevronRight size={18} />
                            </button>
                            
                            {/* Image Thumbnail */}
                            <div className="w-10 h-10 rounded bg-slate-950 overflow-hidden relative group-image shrink-0 border border-slate-800">
                                {loc.imageUrl ? (
                                    <img src={loc.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        {isRoom ? <Icons.Location size={16} /> : <Icons.Server size={16} />}
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-image-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Icons.Plus size={14} className="text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(loc.id, e.target.files[0])} />
                                </label>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className={`font-bold ${isRoom ? 'text-white text-base' : 'text-slate-300 text-sm'}`}>{loc.name}</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{loc.type}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button 
                                    onClick={() => {
                                        setNewLoc({...newLoc, parentId: loc.id});
                                        // Auto-scroll to add form
                                        document.getElementById('add-loc-form')?.scrollIntoView({ behavior: 'smooth' });
                                    }} 
                                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded flex items-center gap-1"
                                >
                                    <Icons.Plus size={12} /> Child
                                </button>
                            </div>
                        </div>
                        
                        {expanded[loc.id] && renderLocationTree(loc.id, depth + 1)}
                    </div>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-slate-700 shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-xl">
           <div>
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <Icons.Location className="text-indigo-500"/> Manage Spaces
               </h2>
               <p className="text-slate-400 text-sm">Define rooms, shelves, and boxes.</p>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-white"><Icons.Close /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
            {locations.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <Icons.Location size={48} className="mx-auto mb-4 opacity-50"/>
                    <p>No locations yet. Add your first room below.</p>
                </div>
            ) : renderLocationTree(undefined)}
        </div>

        <div id="add-loc-form" className="p-6 border-t border-slate-800 bg-slate-950 rounded-b-xl">
             <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase flex items-center gap-2">
                 <Icons.PlusCircle size={16} /> Add New Location
             </h3>
             
             {/* Breadcrumb for Parent */}
             {newLoc.parentId && (
                 <div className="mb-3 flex items-center gap-2">
                     <span className="text-xs text-slate-500">Inside:</span>
                     <div className="bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded text-sm flex items-center gap-2 border border-indigo-500/30">
                         {locations.find(l => l.id === newLoc.parentId)?.name}
                         <button onClick={() => setNewLoc({...newLoc, parentId: ''})} className="hover:text-white"><Icons.Close size={14}/></button>
                     </div>
                 </div>
             )}

             <div className="flex flex-col sm:flex-row gap-3">
                 <input 
                    placeholder="Location Name (e.g. Living Room)" 
                    value={newLoc.name}
                    onChange={e => setNewLoc({...newLoc, name: e.target.value})}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                 />
                 <select 
                    value={newLoc.type}
                    onChange={e => setNewLoc({...newLoc, type: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                 >
                     <option value="Room">Room</option>
                     <option value="Shelf">Shelf</option>
                     <option value="Box">Box</option>
                     <option value="Stack">Stack</option>
                 </select>
                 <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium shadow-lg shadow-indigo-900/20">
                     Add
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};