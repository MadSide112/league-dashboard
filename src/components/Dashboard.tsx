import React from 'react';
import { Participant } from '../types';
import LeagueLogo from './LeagueLogo';

interface DashboardProps {
  participants: Participant[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ participants, isLoading, onRefresh }) => {
  // Сортировка по убыванию баллов
  const sortedParticipants = [...participants].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Шапка */}
      <header className="flex flex-col items-center mb-16 text-center">
        <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
          <LeagueLogo />
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase mb-4 text-white">
          Лига <span className="text-amber-500 font-medium">Чемпионов</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="h-px w-12 bg-amber-500/50"></div>
          <p className="text-sm tracking-[0.4em] text-neutral-500 uppercase">
            01.03.2026 — 01.09.2026
          </p>
          <div className="h-px w-12 bg-amber-500/50"></div>
        </div>
        
        {/* Кнопка обновления для пользователя */}
        {onRefresh && (
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className={`mt-8 px-6 py-2 text-[10px] tracking-[0.2em] uppercase border border-white/10 rounded-full transition-all hover:border-amber-500/50 hover:text-amber-500 ${isLoading ? 'opacity-50 animate-pulse' : ''}`}
          >
            {isLoading ? 'Обновление...' : 'Обновить результаты'}
          </button>
        )}
      </header>

      {/* Список участников */}
      <div className="space-y-4">
        {sortedParticipants.map((p, index) => {
          const isTop3 = index < 3;
          const rankColors = [
            'border-amber-500/40 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]',
            'border-neutral-400/30 bg-neutral-400/5',
            'border-orange-800/30 bg-orange-800/5'
          ];

          return (
            <div 
              key={p.id}
              className={`relative overflow-hidden group border transition-all duration-500 ${
                isTop3 ? rankColors[index] : 'border-white/5 bg-neutral-900/20 hover:border-white/20'
              } rounded-xl p-6 flex flex-col md:flex-row items-center gap-6`}
            >
              {/* Ранг */}
              <div className="flex-shrink-0 w-12 flex justify-center">
                {index === 0 ? <span className="text-3xl">🏆</span> :
                 index === 1 ? <span className="text-3xl">🥈</span> :
                 index === 2 ? <span className="text-3xl">🥉</span> :
                 <span className="text-xl font-light text-neutral-600">{(index + 1).toString().padStart(2, '0')}</span>}
              </div>

              {/* Инфо */}
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-xl font-medium tracking-wide mb-3 group-hover:text-amber-500 transition-colors">
                  {p.name}
                </h3>
                
                {/* Параметры */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {p.parameters.map((param, idx) => (
                    <div key={idx} className="px-2 py-1 rounded bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-tighter text-neutral-500">{param.name}</span>
                      <span className="text-[10px] font-bold text-amber-500/80">{param.value * param.weight}</span>
                    </div>
                  ))}
                  <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-tighter text-amber-500">Выручка</span>
                    <span className="text-[10px] font-bold text-amber-500">
                      {Math.floor(p.revenue / 50000) * 5}
                    </span>
                  </div>
                </div>
              </div>

              {/* Баллы */}
              <div className="flex-shrink-0 text-center md:text-right min-w-[120px]">
                <div className="text-4xl font-light tracking-tighter text-white">
                  {p.totalPoints}<span className="text-xs uppercase tracking-widest text-neutral-500 ml-2">pts</span>
                </div>
                <div className="w-full bg-white/5 h-1 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((p.totalPoints / (sortedParticipants[0].totalPoints || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Футер */}
      <footer className="mt-20 text-center text-neutral-600">
        <p className="text-[10px] uppercase tracking-[0.5em]">Обновлено: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
};
