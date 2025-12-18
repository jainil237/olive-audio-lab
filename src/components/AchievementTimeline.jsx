import React, { useState, useRef, useEffect } from 'react';
import { GlassCard, Pill } from './ui/primitives.jsx';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

const TimelineItem = ({ achievement, isAdmin, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  
  return (
    <GlassCard className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative">
       {/* ... existing content ... */}
       <div>
          <h3 className="text-xl font-semibold text-white">{achievement.title}</h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-2xl">{achievement.desc}</p>
       </div>
       <div className="flex items-center gap-3">
          {achievement.category && <Pill className="text-xs">{achievement.category}</Pill>}
          <span className="text-sm font-mono text-lime-300/80 border border-lime-400/30 rounded-full px-3 py-1">
            {achievement.year}
          </span>
          
          {isAdmin && (
            <div className="relative ml-2" ref={menuRef}>
               <button onClick={() => setShowMenu(!showMenu)}><MoreVertical size={16} className="text-zinc-500 hover:text-white"/></button>
               {showMenu && (
                 <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl overflow-hidden flex flex-col z-50">
                   <button onClick={() => onEdit(achievement)} className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800"> <Edit size={12}/> Edit </button>
                   <button onClick={() => onDelete(achievement.id)} className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-zinc-800"> <Trash2 size={12}/> Delete </button>
                 </div>
               )}
            </div>
          )}
       </div>
    </GlassCard>
  );
};

const AchievementTimeline = ({ achievements = [], isAdmin, onEdit, onDelete }) => (
  <div className="space-y-4">
    {achievements.map((achievement) => (
      <TimelineItem 
        key={achievement.id} 
        achievement={achievement} 
        isAdmin={isAdmin} 
        onEdit={onEdit} 
        onDelete={onDelete} 
      />
    ))}
  </div>
);

export default AchievementTimeline;