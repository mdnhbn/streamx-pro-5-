import React, { useState, useEffect } from 'react';
import { X, Lock, RefreshCw, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { translations } from '../translations';
import { Language } from '../types';

interface WebViewModalProps {
  platform: string;
  onClose: () => void;
  onLoginSuccess: () => void;
  language: Language;
}

export const WebViewModal: React.FC<WebViewModalProps> = ({ platform, onClose, onLoginSuccess, language }) => {
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const t = translations[language];

  useEffect(() => {
    // Generate a realistic looking login URL
    const baseUrl = platform === 'YouTube' ? 'https://accounts.google.com/signin/v2/identifier?service=youtube' : 
                   platform === 'TikTok' ? 'https://www.tiktok.com/login' :
                   platform === 'Dailymotion' ? 'https://www.dailymotion.com/signin' :
                   `https://${platform.toLowerCase()}.com/login`;
    setUrl(baseUrl);

    // Simulate page load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [platform]);

  const handleLoginSim = () => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-white dark:bg-dark-surface flex flex-col animate-slide-up">
      {/* WebView Header (Browser Bar) */}
      <div className="bg-gray-100 dark:bg-gray-800 p-2 border-b border-gray-300 dark:border-gray-700 flex items-center gap-2 shadow-sm">
        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1 bg-white dark:bg-black rounded-lg px-3 py-2 flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 overflow-hidden">
            <Lock size={12} className="text-green-500 shrink-0" />
            <span className="truncate flex-1 font-mono">{url}</span>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </div>
        <div className="flex gap-1 text-gray-500">
             <ChevronLeft size={24} />
             <ChevronRight size={24} />
        </div>
      </div>

      {/* WebView Content Area */}
      <div className="flex-1 relative bg-white flex flex-col items-center justify-center p-6">
        {loading ? (
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-mono">{t.simulatingWebView}</p>
            </div>
        ) : (
            <div className="w-full max-w-sm border border-gray-200 shadow-xl rounded-lg p-8 flex flex-col gap-6">
                <div className="flex justify-center mb-4">
                    {/* Platform Logo Placeholder */}
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Globe size={32} className="text-gray-400" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center text-gray-800">Sign in to {platform}</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Email or Phone" className="w-full p-3 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                    <input type="password" placeholder="Password" className="w-full p-3 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                </div>
                <button 
                    onClick={handleLoginSim}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors"
                >
                    Sign In
                </button>
                <p className="text-xs text-center text-gray-500 mt-4">
                    This is a secure native view. StreamX Pro does not store your credentials.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};