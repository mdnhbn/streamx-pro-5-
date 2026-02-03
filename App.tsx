
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Home, 
  Flame, 
  Library, 
  Crown, 
  History, 
  Bookmark, 
  User, 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  Wifi, 
  ArrowUpLeft 
} from 'lucide-react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { ViewState, VideoData, UserSettings } from './types';
import { translations } from './translations';
import { adManager } from './services/adManager';
import { streamService } from './services/streamService';
import { VideoCard } from './components/VideoCard';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { AdBanner } from './components/AdBanner';
import { ProModal } from './components/ProModal';
import { WebViewModal } from './components/WebViewModal';
import { SettingsView } from './components/SettingsView';
import { LiveScoreTicker } from './components/LiveScoreTicker';
import { MOCK_VIDEOS } from './constants';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<any>(null);

  // Settings & State
  const [settings, setSettings] = useState<UserSettings>({
    country: 'US',
    language: 'en',
    incognito: false
  });
  
  const [currentPlatform, setCurrentPlatform] = useState<string>('All');
  const [loggedInPlatforms, setLoggedInPlatforms] = useState<string[]>([]);
  
  // Data State
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true); // Start loading, but UI handles it
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [error, setError] = useState(false);
  
  // Local Data State
  const [history, setHistory] = useState<VideoData[]>([]);
  const [bookmarks, setBookmarks] = useState<VideoData[]>([]);
  const [loginModal, setLoginModal] = useState<{show: boolean, platform: string} | null>(null);
  const [showInterstitial, setShowInterstitial] = useState(false);

  const t = translations[settings.language] || translations['en'];

  // --- INITIALIZATION LOGIC ---
  useEffect(() => {
    // 1. NON-BLOCKING SPLASH SCREEN HIDE
    // We try to hide immediately, but also set a safety timeout in case the plugin hangs.
    const hideSplash = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                await SplashScreen.hide();
            } catch (e) {
                console.warn('Splash hide failed', e);
            }
        }
    };
    
    // Attempt fast hide
    hideSplash();
    
    // Safety timeout: Force hide after 2 seconds if it hasn't happened
    const safetyTimer = setTimeout(hideSplash, 2000);

    // 2. THEME SETUP
    document.documentElement.classList.add('dark'); // Force dark mode initially to match splash

    // 3. SAFE LOCAL STORAGE LOADING
    try {
        const safeParse = (key: string, fallback: any) => {
            const item = localStorage.getItem(key);
            try {
                return item ? JSON.parse(item) : fallback;
            } catch (e) {
                console.error(`Error parsing ${key}`, e);
                return fallback;
            }
        };

        const savedPlatform = safeParse('streamx_active_platform', 'All');
        setCurrentPlatform(savedPlatform);

        setHistory(safeParse('streamx_history', []));
        setBookmarks(safeParse('streamx_bookmarks', []));
        setSettings(safeParse('streamx_settings', { country: 'US', language: 'en', incognito: false }));
        setLoggedInPlatforms(safeParse('streamx_logins', []));
        
        const savedProExpiry = localStorage.getItem('streamx_pro_expiry');
        if (savedProExpiry) {
            const expiry = new Date(savedProExpiry);
            if (expiry > new Date()) setIsPro(true);
            else localStorage.removeItem('streamx_pro_expiry');
        }
    } catch (e) {
        console.error("Critical storage error", e);
    }

    return () => clearTimeout(safetyTimer);
  }, []);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('streamx_settings', JSON.stringify(settings));
  }, [settings]);

  // Persist Platform
  useEffect(() => {
      localStorage.setItem('streamx_active_platform', currentPlatform);
  }, [currentPlatform]);

  // Unified Data Fetcher with Feedback
  const fetchData = useCallback(async () => {
    setLoading(true);
    // Dynamic loading text
    let action = 'Loading';
    if (view === ViewState.SEARCH) action = 'Searching';
    if (view === ViewState.LIVE_SPORTS) action = 'Finding Live Sports';
    
    setLoadingText(`${action}...`);
    setError(false);
    
    try {
        let fetchedVideos: VideoData[] = [];
        
        if (view === ViewState.SEARCH && searchQuery) {
            fetchedVideos = await streamService.search(searchQuery, currentPlatform);
        } else if (view === ViewState.LIVE_SPORTS) {
            // Auto-search logic for Live Sports
            fetchedVideos = await streamService.search('Live Cricket Match', 'All');
        } else {
            fetchedVideos = await streamService.getTrending(currentPlatform, settings.country);
        }
        
        setVideos(fetchedVideos);
    } catch (err) {
        console.error("Fetch failed", err);
        // Fallback to avoid empty screen
        if (videos.length === 0) {
             setVideos(MOCK_VIDEOS); 
        }
    } finally {
        setLoading(false);
    }
  }, [view, currentPlatform, searchQuery, settings.country]);

  // Refetch when dependencies change
  useEffect(() => {
      // Delay fetch slightly to allow UI to paint first (Async Data Loading)
      const timer = setTimeout(() => {
        if (view === ViewState.HOME || view === ViewState.TRENDING || view === ViewState.SEARCH || view === ViewState.LIVE_SPORTS) {
            fetchData();
        }
      }, 100);
      return () => clearTimeout(timer);
  }, [fetchData]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleVideoClick = (video: VideoData) => {
    if (!isPro) {
        const shouldShow = adManager.checkAndIncrement();
        if (shouldShow) {
            setShowInterstitial(true);
            setTimeout(() => {
                setShowInterstitial(false);
                setCurrentVideo(video);
            }, 3000);
            return;
        }
    }
    setCurrentVideo(video);
  };

  // Search Logic with Debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchQuery(val);
      
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      
      if (val.trim().length > 1) {
          searchTimeout.current = setTimeout(async () => {
              const suggs = await streamService.getSuggestions(val);
              setSuggestions(suggs);
              setShowSuggestions(true);
          }, 300);
      } else {
          setSuggestions([]);
          setShowSuggestions(false);
      }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setShowSuggestions(false);
      if (searchQuery.trim()) {
          setView(ViewState.SEARCH);
          fetchData();
      }
  };

  const handleSuggestionClick = (sugg: string) => {
      setSearchQuery(sugg);
      setShowSuggestions(false);
      setView(ViewState.SEARCH);
      setTimeout(() => fetchData(), 0); 
  };

  const addToHistory = (video: VideoData) => {
    if (settings.incognito) return;
    const newHistory = [video, ...history.filter(v => v.id !== video.id)].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('streamx_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('streamx_history');
  };

  const toggleBookmark = (video: VideoData) => {
    const exists = bookmarks.find(v => v.id === video.id);
    let newBookmarks;
    if (exists) {
      newBookmarks = bookmarks.filter(v => v.id !== video.id);
    } else {
      newBookmarks = [video, ...bookmarks];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('streamx_bookmarks', JSON.stringify(newBookmarks));
  };

  const handleLoginSuccess = () => {
    if (loginModal) {
        const newLogins = [...loggedInPlatforms, loginModal.platform];
        setLoggedInPlatforms(newLogins);
        localStorage.setItem('streamx_logins', JSON.stringify(newLogins));
        setLoginModal(null);
    }
  };

  const renderContent = () => {
    if (view === ViewState.SETTINGS_PRIVACY) {
        return (
            <SettingsView 
                history={history}
                onClearHistory={clearHistory}
                incognito={settings.incognito}
                toggleIncognito={() => setSettings(prev => ({ ...prev, incognito: !prev.incognito }))}
                onBack={() => setView(ViewState.HOME)}
                onVideoClick={handleVideoClick}
                language={settings.language}
            />
        );
    }

    if (loading && videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-fade-in">
                <div className="relative">
                    <Loader2 size={48} className="text-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Wifi size={16} className="text-primary/50" />
                    </div>
                </div>
                <p className="text-gray-500 text-sm animate-pulse">{loadingText}</p>
            </div>
        );
    }

    if (error && videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
                <AlertTriangle size={40} className="text-red-500 mb-4" />
                <h3 className="text-lg font-bold dark:text-white mb-2">Network Busy</h3>
                
                <p className="text-gray-500 text-sm mb-4">
                    The servers are currently experiencing high traffic.<br/>
                    Please try a different platform or retry.
                </p>
                
                <button 
                  onClick={fetchData} 
                  className="bg-primary text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transform active:scale-95 transition-transform"
                >
                    <RefreshCw size={18} /> Retry
                </button>
            </div>
        );
    }

    let title = view === ViewState.SEARCH ? `Search: "${searchQuery}"` : 
                view === ViewState.TRENDING ? t.trendingNow : 
                view === ViewState.LIVE_SPORTS ? t.liveCricket : t.whatsNew;

    return (
        <div className="pb-24 animate-fade-in">
            {/* Live Sports Ticker Widget */}
            {view === ViewState.LIVE_SPORTS && <LiveScoreTicker />}

            {currentPlatform !== 'All' && (
                <div className="px-4 py-2 bg-gray-100 dark:bg-dark-surface-light flex justify-between items-center">
                    <span className="text-sm font-bold dark:text-white">Filtered: {currentPlatform}</span>
                    <button onClick={() => setCurrentPlatform('All')} className="text-xs text-primary font-bold">Clear</button>
                </div>
            )}
            
            <div className="px-4 py-3">
            <h2 className="text-lg font-bold dark:text-white mb-2">{title}</h2>
            {videos.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <div className="mb-2">No videos found.</div>
                    <button onClick={fetchData} className="text-primary text-sm underline">Try refreshing</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                    <VideoCard key={video.id} video={video} onClick={handleVideoClick} />
                ))}
                </div>
            )}
            </div>
        </div>
    );
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-oled-black transition-colors duration-200`}>
      {/* Top Navigation / Search - ALWAYS RENDERED IMMEDIATELY */}
      <div className="sticky top-0 z-40 bg-primary shadow-md">
        <div className="flex items-center gap-3 px-3 py-3">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-1">
            <Menu size={24} />
          </button>
          
          {/* Search Bar with Suggestions */}
          <div className="flex-1 relative">
            <form onSubmit={handleSearchSubmit} className="bg-white/20 hover:bg-white/30 transition-colors rounded-lg flex items-center px-3 py-2 text-white placeholder-white/70">
                <Search size={18} className="mr-2 opacity-80" />
                <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="bg-transparent border-none outline-none text-sm w-full placeholder-white/70 text-white"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                }}
                />
            </form>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {suggestions.map((sugg, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSuggestionClick(sugg)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                        >
                            <Search size={14} className="text-gray-400" />
                            <span className="truncate">{sugg}</span>
                            <ArrowUpLeft size={14} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          {!isPro && (
            <button 
              onClick={() => setShowProModal(true)}
              className="bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm shrink-0"
            >
              <Crown size={12} fill="black" /> {t.proBadge}
            </button>
          )}
        </div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLoginRequest={(platform) => setLoginModal({ show: true, platform })}
        onPlatformSelect={setCurrentPlatform}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings({ ...settings, ...newSettings })}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenPrivacy={() => setView(ViewState.SETTINGS_PRIVACY)}
        loggedInPlatforms={loggedInPlatforms}
        onOpenLiveSports={() => setView(ViewState.LIVE_SPORTS)}
      />
      
      {/* Main Content Area - Async Loaded */}
      <main className="max-w-4xl mx-auto min-h-screen relative" onClick={() => setShowSuggestions(false)}>
        {view === ViewState.LIBRARY ? (
          <div className="pb-24 px-4 py-3 animate-fade-in">
             <div className="mb-6">
               <h2 className="text-lg font-bold dark:text-white mb-3 flex items-center gap-2">
                 <Bookmark size={20} className="text-primary" /> {t.saved} ({bookmarks.length})
               </h2>
               {bookmarks.length === 0 ? (
                 <p className="text-sm text-gray-500">No saved videos yet.</p>
               ) : (
                 <div className="space-y-4">
                   {bookmarks.map(video => (
                     <VideoCard key={`bm-${video.id}`} video={video} onClick={handleVideoClick} isCompact={true} />
                   ))}
                 </div>
               )}
             </div>

             <div>
               <h2 className="text-lg font-bold dark:text-white mb-3 flex items-center gap-2">
                 <History size={20} className="text-gray-500" /> {t.recentlyWatched}
               </h2>
               <button onClick={() => setView(ViewState.SETTINGS_PRIVACY)} className="text-sm text-primary underline mb-2">Manage History</button>
               {history.length === 0 ? (
                 <p className="text-sm text-gray-500">{t.emptyHistory}</p>
               ) : (
                 <div className="space-y-4">
                   {history.slice(0, 3).map(video => (
                     <VideoCard key={`hist-${video.id}`} video={video} onClick={handleVideoClick} isCompact={true} />
                   ))}
                 </div>
               )}
             </div>
          </div>
        ) : view === ViewState.SUBSCRIPTIONS ? (
          <div className="pb-24 px-4 py-3 animate-fade-in">
             <h2 className="text-lg font-bold dark:text-white mb-4">{t.subscriptions}</h2>
             <div className="flex flex-col gap-4">
               {MOCK_VIDEOS.map(v => (
                 <div key={v.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={v.avatar} className="w-12 h-12 rounded-full" alt="channel" />
                      <div>
                        <div className="font-bold dark:text-white">{v.uploader}</div>
                        <div className="text-xs text-gray-500">2.4M Subs • {v.platform}</div>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-gray-500 border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full">
                      Unsubscribe
                    </button>
                 </div>
               ))}
             </div>
          </div>
        ) : (
            renderContent()
        )}
        <AdBanner isPro={isPro} position="bottom" />
      </main>

      {/* Bottom Navigation - ALWAYS RENDERED IMMEDIATELY */}
      {view !== ViewState.PLAYER && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-2 z-40 pb-[60px] md:pb-2">
            <button 
            onClick={() => setView(ViewState.HOME)}
            className={`flex flex-col items-center p-2 ${view === ViewState.HOME ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
            >
            <Home size={22} fill={view === ViewState.HOME ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 font-medium">{t.home}</span>
            </button>
            
            <button 
            onClick={() => setView(ViewState.TRENDING)}
            className={`flex flex-col items-center p-2 ${view === ViewState.TRENDING ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
            >
            <Flame size={22} fill={view === ViewState.TRENDING ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 font-medium">{t.trending}</span>
            </button>

            <button 
            onClick={() => setView(ViewState.SUBSCRIPTIONS)}
            className={`flex flex-col items-center p-2 ${view === ViewState.SUBSCRIPTIONS ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
            >
            <User size={22} fill={view === ViewState.SUBSCRIPTIONS ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 font-medium">{t.subscriptions}</span>
            </button>

            <button 
            onClick={() => setView(ViewState.LIBRARY)}
            className={`flex flex-col items-center p-2 ${view === ViewState.LIBRARY ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
            >
            <Library size={22} fill={view === ViewState.LIBRARY ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 font-medium">{t.library}</span>
            </button>
        </div>
      )}

      {/* Modals */}
      {currentVideo && (
        <Player 
          video={currentVideo} 
          onClose={() => setCurrentVideo(null)} 
          isPro={isPro}
          onAddToHistory={addToHistory}
          onToggleBookmark={toggleBookmark}
          isBookmarked={bookmarks.some(b => b.id === currentVideo.id)}
        />
      )}

      {showProModal && (
        <ProModal 
          onClose={() => setShowProModal(false)} 
          onSubscribe={() => setIsPro(true)} 
          language={settings.language}
        />
      )}

      {/* Realistic WebView Modal */}
      {loginModal && (
        <WebViewModal 
            platform={loginModal.platform}
            onClose={() => setLoginModal(null)}
            onLoginSuccess={handleLoginSuccess}
            language={settings.language}
        />
      )}

      {/* Interstitial Ad Overlay Simulation */}
      {showInterstitial && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
             <div className="absolute top-4 right-4 text-white/50 text-xs">ADVERTISEMENT</div>
             <div className="w-full h-full max-w-sm max-h-[600px] bg-white flex items-center justify-center rounded">
                <span className="text-2xl font-bold text-gray-400">UNITY ADS / ADMOB INTERSTITIAL</span>
             </div>
             <div className="text-white mt-4">Video will play in 3s...</div>
        </div>
      )}
    </div>
  );
}

export default App;
