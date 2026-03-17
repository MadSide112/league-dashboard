import React from 'react';
import logoSrc from '../assets/logo.png';

interface LeagueLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClassMap: Record<NonNullable<LeagueLogoProps['size']>, string> = {
  sm: 'w-20 h-20',
  md: 'w-28 h-28',
  lg: 'w-40 h-40',
};

const LeagueLogo: React.FC<LeagueLogoProps> = ({ size = 'md' }) => {
  return (
    <img
      src={logoSrc}
      alt="Логотип Лиги Чемпионов"
      className={`object-contain select-none flex-shrink-0 ${sizeClassMap[size]} ${className}`}
      draggable={false}
      />
  );
};

export default LeagueLogo;
