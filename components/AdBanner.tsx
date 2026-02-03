import React from 'react';
import { AdBannerProps } from '../types';
import { AD_CONFIG } from '../config/adConfig';
import { ExternalLink } from 'lucide-react';

export const AdBanner: React.FC<AdBannerProps> = ({ isPro, position }) => {
  // 1. Hide if Pro or globally disabled
  if (isPro || !AD_CONFIG.SHOW_BANNERS) return null;

  // 2. Determine Link and Provider Name
  const adLink = AD_CONFIG.ADSTERRA_URL || AD_CONFIG.MONEYTAG_URL || '#';
  const providerName = AD_CONFIG.ADSTERRA_URL ? 'Adsterra' : (AD_CONFIG.MONEYTAG_URL ? 'MoneyTag' : 'Sponsor');
  const hasLink = adLink !== '#';

  const containerClasses = position === 'bottom' 
    ? "fixed bottom-[60px] left-0 right-0 z-30 bg-gray-200 dark:bg-dark-surface-light border-t border-gray-300 dark:border-gray-800"
    : "w-full bg-gray-200 dark:bg-dark-surface-light border-b border-gray-300 dark:border-gray-800";

  return (
    <div className={`${containerClasses} p-1 flex flex-col items-center justify-center animate-fade-in`}>
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Ad • {providerName}</span>
      </div>
      
      {/* Clickable Banner Area */}
      <a 
        href={hasLink ? adLink : undefined}
        target={AD_CONFIG.OPEN_IN_NEW_TAB ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="w-full max-w-[320px] h-[50px] bg-gray-300 dark:bg-gray-700 flex items-center justify-center rounded overflow-hidden relative group cursor-pointer"
        onClick={(e) => {
            if (!hasLink) e.preventDefault();
        }}
      >
        {/* Background Animation / Placeholder Visuals */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"></div>
        
        {/* Ad Text / Content */}
        <div className="relative z-10 flex flex-col items-center">
             <span className="text-xs text-gray-600 dark:text-gray-300 font-bold flex items-center gap-2">
                {hasLink ? 'OPEN OFFER' : 'BANNER SPACE'} 
                {hasLink && <ExternalLink size={12} />}
             </span>
             <span className="text-[9px] text-gray-500 dark:text-gray-400">Tap to see details</span>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
      </a>
    </div>
  );
};