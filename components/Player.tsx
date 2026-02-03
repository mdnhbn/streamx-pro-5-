import React, { useState, useRef, useEffect } from 'react';
import { VideoData } from '../types';
import { streamService } from '../services/streamService';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { 
  Minimize2, 
  Download, 
  Headphones, 
  ListPlus, 
  PictureInPicture,
  X,
  Check,
  AlertCircle,
  Loader2,
  BatteryCharging
} from 'lucide-react';

interface PlayerProps {
  video: VideoData;
  onClose: () => void;
  isPro: boolean;
  onAddToHistory: (video: VideoData) => void;
  onToggleBookmark: (video: VideoData) => void;
  isBookmarked: boolean;
}

export const Player: React.FC<PlayerProps> = ({ 
  video, 
  onClose, 
  isPro,
  onAddToHistory,
  onToggleBookmark,
  isBookmarked
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Background Play / Audio Mode State
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    setStreamUrl(null);

    const loadStream = async () => {
        try {
            if (video.platform === 'Dailymotion') {
                const url = await streamService.getStreamUrl(video.id, video.platform);
                if (mounted) {
                    setStreamUrl(url);
                    setLoading(false);
                }
            } else if (video.platform === 'YouTube') {
                const url = await streamService.getStreamUrl(video.id, video.platform);
                if (mounted) {
                    if (url) {
                        setStreamUrl(url);
                    } else {
                        setError(true);
                    }
                    setLoading(false);
                }
            } else {
                // Mock Platforms / Fallback
                if (mounted) {
                    setStreamUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
                    setLoading(false);
                }
            }
        } catch (e) {
            console.error(e);
            if (mounted) {
                setError(true);
                setLoading(false);
            }
        }
    };

    loadStream();
    onAddToHistory(video);

    return () => { mounted = false; };
  }, [video]);

  // Autoplay effect
  useEffect(() => {
    if (!loading && streamUrl && videoRef.current && video.platform !== 'Dailymotion') {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.log('Autoplay prevented', e));
        }
    }
  }, [loading, streamUrl, video.platform]);

  // Media Session Setup
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: video.title,
        artist: video.uploader,
        artwork: [{ src: video.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
      });
      
      navigator.mediaSession.setActionHandler('play', () => {
          videoRef.current?.play();
          setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
          videoRef.current?.pause();
          setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {});
      navigator.mediaSession.setActionHandler('nexttrack', () => {});
    }
  }, [video]);

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await videoRef.current.requestPictureInPicture();
        }
    } catch (err) {
        console.error("PiP failed", err);
    }
  };

  const toggleBackgroundMode = () => {
      setIsBackgroundMode(!isBackgroundMode);
  };

  const handleNativeDownload = async (quality: string) => {
    if (!streamUrl || video.platform === 'Dailymotion') {
        alert("Download unavailable for this stream source.");
        setShowDownloadMenu(false);
        return;
    }

    setDownloadProgress('Starting...');
    
    try {
        const fileName = `streamx_${video.id}_${Date.now()}.mp4`;
        const isNative = (window as any).Capacitor?.isNative;

        if (isNative) {
            // Using Capacitor Filesystem
            // Note: For large files, we typically use the Capacitor Http.downloadFile or similar, 
            // but here we demonstrate the Filesystem logic as requested.
            // Since we don't have the blob directly, we have to fetch it first.
            
            const response = await fetch(streamUrl);
            const blob = await response.blob();
            
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                try {
                    await Filesystem.writeFile({
                        path: fileName,
                        data: base64data,
                        directory: Directory.Documents,
                    });
                    setDownloadProgress('Saved to Documents!');
                    setTimeout(() => setShowDownloadMenu(false), 1500);
                } catch(e) {
                    console.error('Write error', e);
                    setDownloadProgress('Error saving file');
                }
            };
        } else {
            // Browser Fallback
            setDownloadProgress('Browser Download...');
            const a = document.createElement('a');
            a.href = streamUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setShowDownloadMenu(false);
        }
    } catch (e) {
        console.error("Download failed", e);
        setDownloadProgress('Failed');
    }
  };

  const isIframe = video.platform === 'Dailymotion';

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-oled-black flex flex-col overflow-y-auto no-scrollbar animate-slide-up">
      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center pointer-events-none">
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-sm pointer-events-auto hover:bg-black/60 transition-colors">
           <Minimize2 size={20} />
        </button>
      </div>

      {/* Video Container */}
      <div className={`w-full aspect-video bg-black sticky top-0 z-0 flex items-center justify-center relative group transition-all duration-300 ${isBackgroundMode ? 'h-16 opacity-0 pointer-events-none' : ''}`}>
        
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900">
                <Loader2 size={48} className="text-primary animate-spin" />
            </div>
        )}

        {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gray-900 text-white gap-2">
                <AlertCircle size={48} className="text-red-500" />
                <p>Stream unavailable</p>
                <button 
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                  className="text-xs bg-white/20 px-3 py-1 rounded-full mt-2"
                >
                    Open in Web
                </button>
            </div>
        )}

        {!loading && !error && streamUrl && (
            isIframe ? (
                <iframe 
                    src={streamUrl} 
                    className="w-full h-full" 
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Player"
                ></iframe>
            ) : (
                <video 
                    ref={videoRef}
                    src={streamUrl}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
            )
        )}
      </div>

      {/* Background Play Active Overlay (OLED SAVER) */}
      {isBackgroundMode && !isIframe && (
          <div className="w-full aspect-video bg-black flex flex-col items-center justify-center relative border-b border-gray-800">
               <div className="animate-pulse flex flex-col items-center gap-3">
                   <BatteryCharging size={48} className="text-green-500" />
                   <div className="text-sm text-gray-400 font-mono text-center">
                       BACKGROUND AUDIO ACTIVE<br/>
                       SCREEN MASKED FOR BATTERY
                   </div>
               </div>
               <button 
                onClick={() => setIsBackgroundMode(false)}
                className="mt-6 px-6 py-2 bg-gray-800 rounded-full text-white text-sm font-bold border border-gray-700 hover:bg-gray-700"
               >
                   Restore Video
               </button>
          </div>
      )}

      {/* Info Section */}
      <div className="p-4 flex flex-col gap-4 bg-white dark:bg-oled-black relative z-10 min-h-screen">
        <div className="flex justify-between items-start">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug flex-1 mr-2">
                {video.title}
            </h1>
            <button onClick={onClose} className="md:hidden text-gray-500">
                <X size={24} />
            </button>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{video.views} • {video.date}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-2 py-2 overflow-x-auto no-scrollbar gap-6 border-b border-gray-200 dark:border-gray-800 pb-4">
            <button className="flex flex-col items-center gap-1 min-w-[60px]" onClick={() => setShowDownloadMenu(true)}>
                <div className="p-2 bg-gray-100 dark:bg-dark-surface rounded-full text-primary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Download size={20} />
                </div>
                <span className="text-xs font-medium dark:text-gray-300">Download</span>
            </button>

            {!isIframe && (
                <button className="flex flex-col items-center gap-1 min-w-[60px]" onClick={togglePip}>
                    <div className="p-2 bg-gray-100 dark:bg-dark-surface rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <PictureInPicture size={20} />
                    </div>
                    <span className="text-xs font-medium dark:text-gray-300">Popup</span>
                </button>
            )}

            {!isIframe && (
                <button 
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                    onClick={toggleBackgroundMode}
                >
                    <div className={`p-2 rounded-full transition-colors ${isBackgroundMode ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        <Headphones size={20} />
                    </div>
                    <span className="text-xs font-medium dark:text-gray-300">Bg Play</span>
                </button>
            )}

             <button 
                className="flex flex-col items-center gap-1 min-w-[60px]"
                onClick={() => onToggleBookmark(video)}
             >
                <div className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {isBookmarked ? <Check size={20} /> : <ListPlus size={20} />}
                </div>
                <span className="text-xs font-medium dark:text-gray-300">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
        </div>

        {/* Channel Info */}
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <img src={video.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{video.uploader}</span>
                    <span className="text-xs text-gray-500">Subscribers hidden</span>
                </div>
            </div>
            <button className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide hover:bg-red-700 transition-colors">
                Subscribe
            </button>
        </div>
      </div>

      {showDownloadMenu && (
        <>
            <div className="fixed inset-0 bg-black/60 z-[70] animate-fade-in" onClick={() => setShowDownloadMenu(false)}></div>
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface-light rounded-t-2xl z-[71] p-5 animate-slide-up shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Download Quality</h3>
                {downloadProgress ? (
                     <div className="p-4 text-center text-primary font-bold">{downloadProgress}</div>
                ) : (
                    <div className="space-y-2">
                        <button onClick={() => handleNativeDownload('1080p')} className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
                            <span className="text-sm font-medium dark:text-gray-200">High Quality (720p/1080p)</span>
                            <span className="text-xs text-gray-500">Video + Audio</span>
                        </button>
                        <button onClick={() => handleNativeDownload('MP3')} className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
                            <span className="text-sm font-medium dark:text-gray-200">Source Stream</span>
                            <span className="text-xs text-gray-500">Raw</span>
                        </button>
                    </div>
                )}
            </div>
        </>
      )}
    </div>
  );
};