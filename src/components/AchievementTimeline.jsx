import React from 'react';
import { GlassCard, Pill } from './ui/primitives.jsx';

const AchievementTimeline = ({ achievements = [] }) => (
  <div className="space-y-4">
    {achievements.map((achievement) => (
      <GlassCard key={achievement.id || achievement.title} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{achievement.title}</h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-2xl">{achievement.desc}</p>
        </div>
        <div className="flex items-center gap-3">
          {achievement.category && <Pill className="text-xs">{achievement.category}</Pill>}
          <span className="text-sm font-mono text-lime-300/80 border border-lime-400/30 rounded-full px-3 py-1">
            {achievement.year}
          </span>
        </div>
      </GlassCard>
    ))}
  </div>
);

export default AchievementTimeline;
