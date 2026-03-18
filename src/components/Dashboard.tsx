import React from 'react';
import { Parameter, Participant } from '../types';
import LeagueLogo from './LeagueLogo';
import dashboardBg from '../assets/dashboard-bg.jpg';

interface DashboardProps {
  participants: Participant[];
  parameters: Parameter[];
}

const medalByRank: Record<number, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
};

const Dashboard: React.FC<DashboardProps> = ({ participants, parameters }) => {
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
  const maxScore = Math.max(...sorted.map((p) => p.totalScore), 1);

  return (
  <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bgImage})` }}>
    <div className="min-h-screen bg-zinc-950/85 backdrop-blur-[2px]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <header className="border border-zinc-800 bg-zinc-900/70 px-6 py-6 md:px-8 md:py-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <LeagueLogo size="md" />
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-amber-200/80">Турнир</p>
                <h1 className="mt-1 font-serif text-3xl uppercase tracking-[0.08em] md:text-4xl">Лига чемпионов</h1>
                <p className="mt-2 text-sm text-zinc-300">01.03.2026 - 01.09.2026</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right sm:w-auto">
              <div className="border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Количество участников</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-100">{participants.length}</p>
              </div>
              <div className="border border-amber-700/40 bg-zinc-950/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Количество баллов у лидера</p>
                <p className="mt-1 text-2xl font-semibold text-amber-300">{sorted[0]?.totalScore ?? 0}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-6 border border-zinc-800 bg-zinc-900/50">
          <div className="grid grid-cols-12 gap-4 border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-zinc-400 md:px-6">
            <div className="col-span-8">Участник и параметры</div>
            <div className="col-span-4 text-right">Итог</div>
          </div>

          {sorted.length === 0 && (
            <div className="px-6 py-16 text-center text-zinc-500">Нет данных для отображения</div>
          )}

          {sorted.map((participant, index) => {
            const rank = index + 1;
            const topLine = rank <= 3 ? 'border-l-2 border-l-amber-400/80' : 'border-l-2 border-l-zinc-700';
            const parameterItems = parameters
              .map((param) => ({
                id: param.id,
                name: param.name,
                score: (participant.parameters[param.name] || 0) * param.weight,
              }))
              .filter((item) => item.score !== 0);

            return (
              <article
                key={participant.id}
                className={`grid grid-cols-12 gap-4 border-b border-zinc-800/90 px-4 py-5 transition-colors hover:bg-zinc-900 md:px-6 ${topLine}`}
              >
                <div className="col-span-12 md:col-span-8">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-700 bg-zinc-950 text-sm font-semibold text-zinc-300">
                      {medalByRank[rank] ?? rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-2xl font-semibold leading-tight text-zinc-100">{participant.fullName}</h2>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-300">
                        {parameterItems.length === 0 && <span className="text-zinc-500">Нет начислений по параметрам</span>}
                        {parameterItems.map((item) => (
                          <span key={item.id} className="whitespace-nowrap">
                            {item.name}: <span className={item.score < 0 ? 'text-rose-300' : 'text-amber-200'}>{item.score}</span>
                          </span>
                        ))}
                        <span className="whitespace-nowrap text-zinc-200">Валовка: {participant.revenue.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-4 md:text-right">
                  <p className="text-5xl font-semibold tracking-tight text-zinc-50">{participant.totalScore}</p>
                  <p className="mt-1 text-sm text-zinc-300">баллов</p>
                  <p className="mt-1 text-sm text-zinc-400">в т.ч. за выручку: {participant.revenueScore}</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-orange-700"
                      style={{ width: `${Math.max(6, (participant.totalScore / maxScore) * 100)}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </main>
      </div>
    </div>
  );

export default Dashboard;
