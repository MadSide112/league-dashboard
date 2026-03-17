import React, { useState } from 'react';
import { Participant } from '../types';

interface ParticipantRowProps {
  participant: Participant;
  rank: number;
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  onDelete: (id: string) => void;
  isAdmin?: boolean;
}

const ParticipantRow: React.FC<ParticipantRowProps> = ({
  participant,
  rank,
  onUpdate,
  onDelete,
  isAdmin = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(participant.fullName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdate(participant.id, { fullName: tempName });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(participant.fullName);
    setIsEditing(false);
  };

  const isTop3 = rank <= 3;
  const rankIcons = ['🥇', '🥈', '🥉'];
  
  const getRankStyles = () => {
    if (rank === 1) return 'border-amber-400/50 bg-gradient-to-r from-neutral-900 via-amber-900/20 to-neutral-900 shadow-[0_0_15px_rgba(251,191,36,0.15)]';
    if (rank === 2) return 'border-slate-400/50 bg-gradient-to-r from-neutral-900 via-slate-800/20 to-neutral-900';
    if (rank === 3) return 'border-orange-600/50 bg-gradient-to-r from-neutral-900 via-orange-900/20 to-neutral-900';
    return 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700';
  };

  const getPointsColor = () => {
    if (rank === 1) return 'text-amber-400';
    if (rank === 2) return 'text-slate-300';
    if (rank === 3) return 'text-orange-500';
    return 'text-amber-100/80';
  };

  if (!isAdmin) {
    return (
      <div className={`relative overflow-hidden p-5 mb-4 rounded-xl border transition-all duration-300 ${getRankStyles()}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 md:w-3/4 flex items-center gap-5">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold border-2
              ${isTop3 ? 'border-amber-500/50 bg-amber-500/10' : 'border-neutral-700 bg-neutral-800 text-neutral-400'}`}>
              {isTop3 ? rankIcons[rank - 1] : rank}
            </div>
            <div className="flex-1">
              <h3 className={`text-2xl font-bold tracking-tight ${isTop3 ? 'text-white' : 'text-neutral-200'}`}>
                {participant.fullName}
              </h3>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                {Object.entries(participant.parameters).map(([key, value]) => (
                  <div key={key} className="text-xs flex items-center gap-2">
                    <span className="text-neutral-500 font-medium uppercase tracking-tighter">{key}:</span>
                    <span className="text-amber-100/90 font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="md:w-1/4 flex flex-col items-end justify-center md:border-l border-neutral-800 md:pl-8">
            <div className="text-right">
              <span className={`text-4xl font-black italic tracking-tighter ${getPointsColor()}`}>
                {participant.totalScore}
              </span>
              <span className="ml-2 text-xs font-bold uppercase text-neutral-500 tracking-widest">pts</span>
            </div>
            <div className="w-full mt-3">
              <div className="flex justify-between text-[10px] mb-1 font-bold text-neutral-500 uppercase tracking-widest">
                <span>Revenue</span>
                <span className="text-neutral-300">{participant.revenue.toLocaleString()} ₽</span>
              </div>
              <div className="h-1 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${rank === 1 ? 'bg-amber-500' : 'bg-neutral-600'}`}
                  style={{ width: `${Math.min(100, (participant.revenueScore / Math.max(1, participant.totalScore)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin row remains similar but styled for dark theme
  return (
    <tr className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 text-sm font-bold border border-neutral-700">
            {rank}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="flex-1 px-3 py-1 bg-neutral-900 border border-neutral-700 text-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-green-500 hover:text-green-400 text-lg">✓</button>
                <button onClick={handleCancel} className="text-red-500 hover:text-red-400 text-lg">✗</button>
              </div>
            ) : (
              <div className="flex items-center group">
                <span className="text-neutral-200 font-medium">{participant.fullName}</span>
                <button onClick={() => setIsEditing(true)} className="ml-2 opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-neutral-300">✏️</button>
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-amber-400 font-bold">{participant.totalScore}</td>
      <td className="py-4 px-4">
        <button onClick={() => onDelete(participant.id)} className="text-xs uppercase tracking-widest font-bold text-red-500/70 hover:text-red-500 transition-colors">Delete</button>
      </td>
    </tr>
  );
};

export default ParticipantRow;