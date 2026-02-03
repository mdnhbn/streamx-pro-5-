
import React, { useState } from 'react';
import { 
  Youtube, 
  Music2, 
  Video, 
  Tv, 
  Globe2, 
  Share2, 
  Disc, 
  X,
  LogIn,
  Sun,
  Moon,
  ChevronDown,
  Shield,
  UserCheck,
  Search,
  Trophy
} from 'lucide-react';
import { UserSettings, ViewState } from '../types';
import { COUNTRIES } from '../constants';
import { translations } from '../translations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRequest: (platform: string) => void;
  onPlatformSelect: (platform: string) => void;
  settings: UserSettings;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenPrivacy: () => void;
  loggedInPlatforms: string[];
  onOpenLiveSports: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onLoginRequest, 
  onPlatformSelect,
  settings, 
  onUpdateSettings,
  theme,
  toggleTheme,
  onOpenPrivacy,
  loggedInPlatforms,
  onOpenLiveSports
}) => {
  const t = translations[settings.language];
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const platforms = [
    { name: 'YouTube', icon: <Youtube size={20} className="text-red-500" /> },
    { name: 'Dailymotion', icon: <Video size={20} className="text-blue-500" /> },
    { name: 'TikTok', icon: <Share2 size={20} className="text-pink-500" /> },
    { name: 'Rumble', icon: <Tv size={20} className="text-green-500" /> },
    { name: 'SoundCloud', icon: <Music2 size={20} className="text-orange-500" /> },
    { name: 'BiliBili', icon: <Tv size={20} className="text-blue-400" /> },
    { name: 'PeerTube', icon: <Globe2 size={20} className="text-gray-500" /> },
    { name: 'Bandcamp', icon: <Disc size={20} className="text-teal-500" /> },
  ];

  // Helper to get country name
  const currentCountryName = COUNTRIES.find(c => c.code === settings.country)?.name || settings.country;

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-oled-black z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Top Header with Theme Toggle */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-primary">
          <h2 className="text-xl font-bold text-white tracking-tighter">StreamX Pro</h2>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full text-white">
                <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 py-2 no-scrollbar">
          
          {/* SPECIAL FEATURES SECTION */}
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Features</div>
          
          <button 
             onClick={() => {
                onOpenLiveSports();
                onClose();
             }}
             className="w-full flex items-center gap-4 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left border-l-4 border-transparent hover:border-red-600"
           >
              <Trophy size={20} className="text-red-600" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{t.liveCricket}</span>
           </button>

          <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>

          {/* Platforms */}
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{t.platforms}</div>
          {platforms.map((p) => {
             const isLoggedIn = loggedInPlatforms.includes(p.name);
             return (
                <div 
                key={p.name}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors group cursor-pointer"
                onClick={() => {
                    onPlatformSelect(p.name);
                    onClose();
                }}
                >
                <div className="flex items-center gap-4">
                    {p.icon}
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.name}</span>
                </div>
                {isLoggedIn ? (
                    <UserCheck size={16} className="text-green-500" />
                ) : (
                    <button 
                        onClick={(e) => {
                        e.stopPropagation();
                        onLoginRequest(p.name);
                        }}
                        className="opacity-100 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all"
                        title={`${t.login} ${p.name}`}
                    >
                        <LogIn size={16} className="text-gray-400" />
                    </button>
                )}
                </div>
             )
          })}
          
          <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>

          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{t.settings}</div>
           
           {/* Searchable Content Country Selector */}
           <div className="px-4 py-3">
              <label className="text-xs text-gray-500 mb-1 block">{t.contentCountry}</label>
              
              {!isCountrySelectorOpen ? (
                <button 
                  onClick={() => setIsCountrySelectorOpen(true)}
                  className="w-full flex items-center justify-between bg-gray-100 dark:bg-dark-surface border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 py-2 px-3 rounded"
                >
                  <span className="truncate mr-2">{currentCountryName}</span>
                  <ChevronDown size={14} className="shrink-0" />
                </button>
              ) : (
                <div className="bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded shadow-lg animate-fade-in">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Search size={14} className="text-gray-500 shrink-0"/>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Search country..." 
                      className="w-full bg-transparent text-sm outline-none dark:text-white"
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                    />
                    <button onClick={() => {
                        setIsCountrySelectorOpen(false);
                        setCountrySearchQuery('');
                    }} className="shrink-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={16}/>
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto no-scrollbar">
                    {filteredCountries.length > 0 ? (
                        filteredCountries.map(c => (
                        <button 
                            key={c.code}
                            onClick={() => {
                            onUpdateSettings({ country: c.code });
                            setIsCountrySelectorOpen(false);
                            setCountrySearchQuery('');
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 border-l-2 ${settings.country === c.code ? 'border-primary text-primary font-bold bg-gray-50 dark:bg-gray-800' : 'border-transparent text-gray-800 dark:text-gray-200'}`}
                        >
                            {c.name}
                        </button>
                        ))
                    ) : (
                        <div className="p-3 text-xs text-gray-500 text-center">No countries found</div>
                    )}
                  </div>
                </div>
              )}
           </div>

           {/* Language Selector */}
           <div className="px-4 py-3">
              <label className="text-xs text-gray-500 mb-1 block">{t.language}</label>
              <div className="flex bg-gray-100 dark:bg-dark-surface rounded p-1 border border-gray-300 dark:border-gray-700">
                 <button 
                    className={`flex-1 text-xs py-1.5 rounded ${settings.language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                    onClick={() => onUpdateSettings({ language: 'en' })}
                 >
                    English
                 </button>
                 <button 
                    className={`flex-1 text-xs py-1.5 rounded ${settings.language === 'bn' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                    onClick={() => onUpdateSettings({ language: 'bn' })}
                 >
                    বাংলা
                 </button>
              </div>
           </div>

           {/* Privacy Button */}
           <button 
             onClick={() => {
                onOpenPrivacy();
                onClose();
             }}
             className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors text-left"
           >
              <Shield size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.privacy}</span>
           </button>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <div className="text-xs text-gray-500 text-center">v1.3.0 (Build 2024.12)</div>
        </div>
      </div>
    </>
  );
};
