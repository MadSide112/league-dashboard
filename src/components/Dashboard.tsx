import React, { useState } from 'react';
import { Parameter, Participant } from '../types';
import LeagueLogo from './LeagueLogo';
import bgImage from '../assets/back.webp';

interface DashboardProps {
  participants: Participant[];
  parameters: Parameter[];
}

const medalByRank: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
  4: '4',
  5: '5',
};

const Dashboard: React.FC<DashboardProps> = ({ participants, parameters }) => {
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
  const maxScore = Math.max(...sorted.map((p) => p.totalScore), 1);

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="min-h-screen w-full bg-zinc-950/60 backdrop-blur-[2px]">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
            {/* ========== HEADER с анимацией появления ========== */}
            <header className="animate-fade-in-down border border-zinc-800 bg-zinc-900/70 px-6 py-6 shadow-2xl shadow-amber-900/10 md:px-8 md:py-7">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="animate-bounce-slow">
                    <LeagueLogo size="md" />
                  </div>
                  <div>
                    <p className="animate-fade-in text-xs uppercase tracking-[0.28em] text-amber-200/80">
                      Турнир
                    </p>
                    <h1 className="animate-fade-in-up mt-1 font-serif text-3xl uppercase tracking-[0.08em] md:text-4xl">
                      Лига чемпионов
                    </h1>
                    <p className="animate-fade-in mt-2 text-sm text-zinc-300">
                      01.03.2026 - 01.09.2026
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <div className="grid w-full grid-cols-2 gap-3 text-right md:w-auto">
                    {/* Карточка с участниками */}
                    <div className="group animate-scale-in border border-zinc-800 bg-zinc-950/70 px-4 py-3 transition-all duration-300 hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/50">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                        Количество участников
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-zinc-100 transition-transform duration-300 group-hover:scale-110">
                        {participants.length}
                      </p>
                    </div>

                    {/* Карточка с баллами лидера */}
                    <div className="group animate-scale-in animation-delay-100 border border-amber-700/40 bg-zinc-950/70 px-4 py-3 transition-all duration-300 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-900/30">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                        Баллы лидера
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-amber-300 transition-transform duration-300 group-hover:scale-110">
                        {sorted[0]?.totalScore ?? 0}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPointsInfo(true)}
                    className="animate-fade-in-up animation-delay-200 mt-3 w-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-xs font-medium tracking-[0.12em] text-zinc-200 transition-all duration-300 hover:border-amber-600 hover:bg-amber-900/20 hover:text-amber-200 hover:shadow-lg hover:shadow-amber-900/20 md:w-auto"
                  >
                    ИНФОРМАЦИЯ О НАЧИСЛЕНИИ БАЛЛОВ
                  </button>
                </div>
              </div>
            </header>

            {/* ========== MAIN LEADERBOARD ========== */}
            <main className="animate-fade-in-up animation-delay-300 mt-6 border border-zinc-800 bg-zinc-900/50 shadow-2xl">
              <div className="grid grid-cols-12 gap-4 border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-zinc-400 md:px-6">
                <div className="col-span-8">Участник и параметры</div>
                <div className="col-span-4 text-right">Итог</div>
              </div>

              {sorted.length === 0 && (
                <div className="animate-pulse px-6 py-16 text-center text-zinc-500">
                  Нет данных для отображения
                </div>
              )}

              {sorted.map((participant, index) => {
                const rank = index + 1;
                const isTop5 = rank <= 5;
                const isTop3 = rank <= 3;

                // Стили для топ-5
                const topLineClass = isTop5
                  ? 'border-l-4 border-l-amber-400'
                  : 'border-l-2 border-l-zinc-700';

                const bgClass = isTop5
                  ? 'bg-gradient-to-r from-amber-950/30 via-zinc-900/50 to-zinc-900/30'
                  : 'bg-zinc-900/0';

                const glowClass = isTop3
                  ? 'shadow-lg shadow-amber-900/20'
                  : '';

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
                    className={`
                      group
                      grid grid-cols-12 gap-4
                      border-b border-zinc-800/90
                      px-4 py-5 md:px-6
                      transition-all duration-500
                      hover:bg-zinc-900/70
                      hover:border-amber-900/30
                      ${topLineClass}
                      ${bgClass}
                      ${glowClass}
                      animate-slide-in-right
                    `}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="col-span-12 md:col-span-8">
                      <div className="flex items-start gap-4">
                        {/* Медаль/Ранг */}
                        <div
                          className={`
                            mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center
                            border font-semibold
                            transition-all duration-300
                            ${
                              isTop3
                                ? 'border-amber-500/50 bg-gradient-to-br from-amber-900/50 to-amber-950 text-amber-200 shadow-lg shadow-amber-900/30 group-hover:scale-110 group-hover:rotate-6'
                                : isTop5
                                ? 'border-amber-700/30 bg-zinc-900 text-amber-300 group-hover:scale-105'
                                : 'border-zinc-700 bg-zinc-950 text-zinc-300 group-hover:border-zinc-600'
                            }
                          `}
                        >
                          <span
                            className={`
                              ${isTop3 ? 'text-2xl animate-pulse-slow' : 'text-sm'}
                            `}
                          >
                            {medalByRank[rank] ?? rank}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Имя участника */}
                          <h2
                            className={`
                              truncate font-semibold leading-tight
                              transition-all duration-300
                              ${
                                isTop3
                                  ? 'text-3xl text-amber-100 group-hover:text-amber-50'
                                  : isTop5
                                  ? 'text-2xl text-zinc-100 group-hover:text-amber-200'
                                  : 'text-2xl text-zinc-100 group-hover:text-zinc-50'
                              }
                            `}
                          >
                            {participant.fullName}
                            {isTop5 && (
                              <span className="ml-2 inline-block animate-bounce text-sm">
                                {rank === 1 && '👑'}
                                {rank === 2 && '⭐'}
                                {rank === 3 && '✨'}
                                {rank === 4 && '💫'}
                                {rank === 5 && '🌟'}
                              </span>
                            )}
                          </h2>

                          {/* Параметры */}
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-300">
                            {parameterItems.length === 0 && (
                              <span className="text-zinc-500">Нет начислений по параметрам</span>
                            )}
                            {parameterItems.map((item) => (
                              <span
                                key={item.id}
                                className="animate-fade-in whitespace-nowrap transition-colors duration-300 hover:text-amber-200"
                              >
                                {item.name}:{' '}
                                <span
                                  className={
                                    item.score < 0
                                      ? 'text-rose-300 font-semibold'
                                      : 'text-amber-200 font-semibold'
                                  }
                                >
                                  {item.score}
                                </span>
                              </span>
                            ))}
                            <span className="whitespace-nowrap font-medium text-zinc-200">
                              Выручка: {participant.revenueScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Правая колонка - баллы */}
<div className="col-span-12 md:col-span-4 md:text-right">
  <p
    className={`
      font-semibold tracking-tight
      transition-all duration-300
      ${
        isTop3
          ? 'text-6xl text-amber-300 group-hover:scale-105 group-hover:text-amber-200'  // ✅ Было scale-110
          : isTop5
          ? 'text-5xl text-amber-400 group-hover:scale-103'  // ✅ Было scale-105
          : 'text-5xl text-zinc-50 group-hover:scale-102 group-hover:text-amber-300'  // ✅ Добавили минимальный scale
      }
    `}
  >
    {participant.totalScore}
  </p>
  <p className="mt-1 text-sm text-zinc-300">баллов</p>
  <p className="mt-1 text-sm text-zinc-400">
    в т.ч. за выручку: {participant.revenueScore}
  </p>

  {/* Прогресс-бар с анимацией */}
  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
    <div
      className={`
        h-full
        transition-all duration-1000 ease-out
        ${
          isTop3
            ? 'animate-gradient bg-gradient-to-r from-amber-600 via-amber-400 to-orange-500'
            : isTop5
            ? 'bg-gradient-to-r from-amber-700 via-amber-500 to-orange-600'
            : 'bg-gradient-to-r from-amber-700 via-amber-500 to-orange-700'
        }
      `}
      style={{
        width: `${Math.max(6, (participant.totalScore / maxScore) * 100)}%`,
      }}
    />
  </div>
</div>
                  </article>
                );
              })}
            </main>
          </div>
        </div>
      </div>

      {/* ========== МОДАЛЬНОЕ ОКНО с анимацией ========== */}
      {showPointsInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm animate-fade-in md:p-8"
          onClick={() => setShowPointsInfo(false)}
        >
          <div
            className="w-full max-w-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="mb-4 border border-zinc-800 bg-zinc-900/80 px-5 py-4 shadow-2xl md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Информация</p>
                  <h2 className="font-serif text-2xl uppercase tracking-[0.08em] text-zinc-100">
                    Начисление баллов
                  </h2>
                </div>
                <button
                  onClick={() => setShowPointsInfo(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 transition-all duration-300 hover:rotate-90 hover:border-amber-600 hover:text-amber-200 hover:shadow-lg hover:shadow-amber-900/50"
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">За что начисляются баллы</h3>

              <div className="space-y-3">
                 <div
            className="animate-slide-in-right flex justify-between border-b border-zinc-800 pb-2 transition-all duration-300 hover:border-amber-700 hover:bg-zinc-800/30"
            style={{ animationDelay: '0ms' }}
          >
            <span className="text-zinc-300">За каждые 50 000 выручки</span>
            <span className="font-semibold text-amber-300">5 баллов</span>
          </div>
                {parameters.map((param, index) => (
                  <div
                    key={param.id}
                    className="animate-slide-in-right flex justify-between border-b border-zinc-800 pb-2 transition-all duration-300 hover:border-amber-700 hover:bg-zinc-800/30 last:border-b-0"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-zinc-300">{param.name}</span>
                    <span className="font-semibold text-amber-300">{param.weight} баллов</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
