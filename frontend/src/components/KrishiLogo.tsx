import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const KrishiLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original Harvest-to-Market Vector Emblem */}
      <div className={`${iconDimensions} relative flex-shrink-0 rounded-xl bg-[#153D2B] p-1.5 shadow-md shadow-[#153D2B]/15 flex items-center justify-center transition-transform hover:scale-105`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Furrow lines (soil & fields) */}
          <path d="M18 78 Q 45 68, 82 78" stroke="#286443" strokeWidth="6" strokeLinecap="round" />
          <path d="M22 66 Q 48 56, 78 66" stroke="#286443" strokeWidth="5" strokeLinecap="round" />
          {/* Sprouting harvest leaf with living lime gradient */}
          <path
            d="M32 68 C 28 35, 58 20, 78 30 C 82 55, 52 68, 32 68 Z"
            fill="#C7F36B"
          />
          {/* Leaf vein line */}
          <path d="M34 66 Q 52 48, 76 32" stroke="#153D2B" strokeWidth="3.5" strokeLinecap="round" />
          {/* Golden sun / Direct market node */}
          <circle cx="76" cy="24" r="9" fill="#E7B85C" />
          <path d="M72 24 L 80 24 M 76 20 L 76 28" stroke="#153D2B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className={`font-editorial font-bold tracking-tight text-[#153D2B] ${textClasses}`}>
            Krishi<span className="text-[#286443] font-light">Direct</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#286443]/70">
            Kisan-to-Buyer Market
          </span>
        </div>
      )}
    </div>
  );
};
