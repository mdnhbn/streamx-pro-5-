import React from 'react';
import { History, Trash2, Shield, ArrowLeft } from 'lucide-react';
import { VideoData, Language } from '../types';
import { translations } from '../translations';
import { VideoCard } from './VideoCard';

interface SettingsViewProps {
  history: VideoData[];
  onClearHistory: () => void;
  incognito: boolean;
  toggleIncognito: () => void;
  onBack: () => void;
  onVideoClick: (v: VideoData) => void;
  language: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  history,
  onClearHistory,
  incognito,
  toggleIncognito,
  onBack,
  onVideoClick,
  language
}) => {
  const t = translations[language];

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-oled-black z-10 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full">
            <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <h2 className="text-lg font-bold dark:text-white">{t.privacy}</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Incognito Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-dark-surface rounded-xl">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${incognito ? 'bg-purple-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    <Shield size={20} />
                </div>
                <div>
                    <div className="font-bold dark:text-white">{t.incognito}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.incognitoDesc}</div>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={incognito} onChange={toggleIncognito} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
        </div>

        {/* History Section */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <History size={18} /> {t.recentlyWatched}
                </h3>
                {history.length > 0 && (
                    <button 
                        onClick={onClearHistory}
                        className="text-xs font-bold text-red-500 flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-full transition-colors"
                    >
                        <Trash2 size={14} /> {t.clearHistory}
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <History size={48} className="mx-auto mb-2 opacity-50" />
                    <p>{t.emptyHistory}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map(video => (
                         <VideoCard key={`hist-set-${video.id}`} video={video} onClick={onVideoClick} isCompact={true} />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};