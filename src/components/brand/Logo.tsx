import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'light' | 'dark' | 'icon-only';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customLogoUrl?: string;
  brandName?: string;
  tagline?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  customLogoUrl,
  brandName = "Meera's Fashion",
  tagline = "Traditional Clothing & Jewelleries",
}) => {
  const isLight = variant === 'light';

  // Size scale
  const dimensions = {
    sm: { icon: 28, text: 'text-lg', sub: 'text-[9px]', customLogoHeight: 'h-8 max-w-[140px]' },
    md: { icon: 38, text: 'text-2xl', sub: 'text-[10px]', customLogoHeight: 'h-10 sm:h-11 max-w-[180px]' },
    lg: { icon: 52, text: 'text-3xl', sub: 'text-xs', customLogoHeight: 'h-12 sm:h-14 max-w-[240px]' },
    xl: { icon: 70, text: 'text-4xl', sub: 'text-sm', customLogoHeight: 'h-16 sm:h-20 max-w-[300px]' },
  }[size];

  // Split brandName into primary title and secondary suffix if applicable
  const renderBrandName = () => {
    if (!brandName || typeof brandName !== 'string') return "Meera's Fashion";
    
    if (brandName.toLowerCase().includes("meera")) {
      const parts = brandName.split(/meera'?s?/i);
      const suffix = (parts && parts[1]) ? parts[1].trim() : '';
      return (
        <>
          Meera<span className="text-[#C94F7C] font-script text-[1.25em] ml-0.5">'s</span>
          {suffix && (
            <span
              className={`font-display uppercase tracking-[0.22em] font-semibold text-xs ml-1.5 ${
                isLight ? 'text-[#F8DDE7]' : 'text-[#9E315A]'
              }`}
            >
              {suffix}
            </span>
          )}
        </>
      );
    }

    return <span>{brandName}</span>;
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon or Custom Uploaded Transparent Logo */}
      <div className="relative flex items-center justify-center shrink-0">
        {customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt={brandName}
            className={`${dimensions.customLogoHeight} w-auto object-contain transition-transform duration-300 hover:scale-105 drop-shadow-xs`}
            onError={(e) => {
              // Hide broken image and revert to default display
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <svg
            width={dimensions.icon}
            height={dimensions.icon}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm transition-transform duration-300 hover:scale-105"
          >
            <defs>
              <linearGradient id="meeraRoseGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C94F7C" />
                <stop offset="45%" stopColor="#9E315A" />
                <stop offset="85%" stopColor="#B76E79" />
                <stop offset="100%" stopColor="#E8CFAF" />
              </linearGradient>
              <linearGradient id="butterflyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8CFAF" />
                <stop offset="100%" stopColor="#C94F7C" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Soft circular halo */}
            <circle cx="50" cy="50" r="46" fill="url(#meeraRoseGold)" fillOpacity="0.08" stroke="url(#meeraRoseGold)" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="41" fill={isLight ? '#241B20' : '#FFF5F8'} stroke="url(#meeraRoseGold)" strokeWidth="0.75" />

            {/* Flowing Woman Silhouette & Saree Draping */}
            <path
              d="M52 24C44 24 38 30 38 38C38 43 41 47 44 50C40 54 34 60 31 70C36 67 42 66 48 68C45 61 46 54 50 50C54 50 58 46 60 41C61 36 60 30 55 25C54 24.3 53 24 52 24Z"
              fill="url(#meeraRoseGold)"
            />
            {/* Hair flow accent & floral hair pin */}
            <path
              d="M38 34C34 38 33 46 36 53C37 47 38 43 42 40C40 37 39 35 38 34Z"
              fill="#E8CFAF"
            />
            {/* Floral hairpin */}
            <circle cx="37" cy="33" r="3.5" fill="#FFF" />
            <circle cx="37" cy="33" r="2" fill="#C94F7C" />
            
            {/* Golden Jhumka Earring accent */}
            <circle cx="49" cy="46" r="1.5" fill="#E8CFAF" />
            <path d="M48 48L50 48L49 52Z" fill="#E8CFAF" />

            {/* Butterfly above profile */}
            <path
              d="M62 26C65 22 71 22 71 27C71 30 67 31 63 29C64 32 61 34 59 32C59 29 61 27 62 26Z"
              fill="url(#butterflyGold)"
            />
            <path
              d="M58 29C56 26 52 27 53 30C54 32 57 32 58 31Z"
              fill="url(#meeraRoseGold)"
            />
          </svg>
        )}
      </div>

      {/* Brand Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-serif font-bold tracking-wider ${dimensions.text} ${
                isLight ? 'text-white' : 'text-[#241B20]'
              }`}
              style={{ letterSpacing: '0.04em' }}
            >
              {renderBrandName()}
            </span>
          </div>
          {variant === 'full' && (
            <span
              className={`tracking-[0.16em] uppercase font-medium truncate ${dimensions.sub} ${
                isLight ? 'text-[#E8CFAF]' : 'text-[#8C5D6C]'
              }`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
