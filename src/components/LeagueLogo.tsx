import React from 'react';

interface LeagueLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClassMap: Record<NonNullable<LeagueLogoProps['size']>, string> = {
  sm: 'w-20 h-20 text-[8px]',
  md: 'w-28 h-28 text-[10px]',
  lg: 'w-40 h-40 text-xs',
};

const LeagueLogo: React.FC<LeagueLogoProps> = ({ size = 'md' }) => {
  return (
    <div className={`relative rounded-full border border-zinc-300/80 text-zinc-100 ${sizeClassMap[size]}`}>
      <div className="absolute inset-1 rounded-full border border-zinc-300/70" />
      <div className="absolute inset-4 rounded-full border border-zinc-300/70" />
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-3">
        <div className="text-[1.4em] leading-none mb-1">★</div>
        <div className="font-serif tracking-[0.14em] text-[1.1em] uppercase">Лига</div>
        <div className="font-serif tracking-[0.1em] text-[1.05em] uppercase">Чемпионов</div>
        <div className="w-2/3 h-px bg-zinc-300/70 my-1.5" />
        <div className="text-[0.88em] tracking-[0.18em] uppercase">Самолет Плюс</div>
      </div>
    </div>
  );
};

export default LeagueLogo;