import React from 'react';
import logoSrc from '../assets/logo.png';

interface LeagueLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClassMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-20 h-20',
  md: 'w-28 h-28',
  lg: 'w-40 h-40',
};

// ⚠️ ВАЖНО: className должен быть в деструктуризации с дефолтным значением ''
const LeagueLogo: React.FC<LeagueLogoProps> = ({ size = 'md', className = '' }) => {
  return (
    <img
      src={logoSrc}
      alt="Логотип Лиги"
      className={`object-contain select-none flex-shrink-0 ${sizeClassMap[size]} ${className}`}
      draggable={false}
    />
  );
};

export default LeagueLogo;
