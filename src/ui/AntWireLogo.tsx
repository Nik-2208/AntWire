/**
 * ANTWRE — Authoritative Brand Logo Component
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Repository: https://github.com/Nik-2208/AntWire
 * Portfolio:  https://nik-portfolio-lime.vercel.app/
 * LinkedIn:   https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/
 *
 * Renders the official AntWire cybernetic-biological neural ant brand asset
 * with guaranteed aspect ratio preservation, responsive scaling, and accessible text.
 */

import React from 'react';
import { ANTWRE_BRAND } from '../theme/design_system';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';

export interface AntWireLogoProps {
  size?: LogoSize;
  showText?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  animateGlow?: boolean;
  glowEffect?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP: Record<LogoSize, { imgHeight: string; imgWidth: string; titleSize: string; subSize: string }> = {
  xs: { imgHeight: 'h-5', imgWidth: 'w-auto max-w-[28px]', titleSize: 'text-xs', subSize: 'text-[9px]' },
  sm: { imgHeight: 'h-7', imgWidth: 'w-auto max-w-[38px]', titleSize: 'text-sm', subSize: 'text-[10px]' },
  md: { imgHeight: 'h-9', imgWidth: 'w-auto max-w-[48px]', titleSize: 'text-base', subSize: 'text-xs' },
  lg: { imgHeight: 'h-12', imgWidth: 'w-auto max-w-[64px]', titleSize: 'text-lg', subSize: 'text-xs' },
  xl: { imgHeight: 'h-16', imgWidth: 'w-auto max-w-[84px]', titleSize: 'text-xl', subSize: 'text-sm' },
  '2xl': { imgHeight: 'h-24', imgWidth: 'w-auto max-w-[120px]', titleSize: 'text-2xl', subSize: 'text-sm' },
  hero: { imgHeight: 'h-32 sm:h-40', imgWidth: 'w-auto max-w-[220px]', titleSize: 'text-3xl sm:text-4xl', subSize: 'text-xs sm:text-sm' },
};

export const AntWireLogo: React.FC<AntWireLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = false,
  subtitleText = ANTWRE_BRAND.tagline,
  animateGlow = false,
  glowEffect = false,
  showBadge = false,
  badgeText = 'OFFICIAL',
  className = '',
  onClick,
}) => {
  const config = SIZE_MAP[size] || SIZE_MAP.md;
  const isGlowActive = animateGlow || glowEffect;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer hover:opacity-95' : ''} ${className}`}
      role="banner"
      aria-label={`${ANTWRE_BRAND.name} — ${ANTWRE_BRAND.tagline}`}
    >
      {/* Official Neural Ant Brand Mark */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        {isGlowActive && (
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md animate-pulse pointer-events-none" />
        )}
        <img
          src={ANTWRE_BRAND.assets.logoPng}
          alt="AntWire Neural Brain & Colony Simulation Logo"
          className={`${config.imgHeight} ${config.imgWidth} object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]`}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Brand Typography */}
      {(showText || showSubtitle || showBadge) && (
        <div className="flex flex-col leading-tight min-w-0">
          <div className="flex items-center gap-2">
            {showText && (
              <span
                className={`font-heading font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent ${config.titleSize}`}
                style={{ letterSpacing: '0.08em' }}
              >
                {ANTWRE_BRAND.name}
              </span>
            )}
            {showBadge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 font-mono tracking-wider font-bold">
                {badgeText}
              </span>
            )}
          </div>
          {showSubtitle && (
            <span className={`text-gray-400 font-sans truncate font-medium ${config.subSize}`}>
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
