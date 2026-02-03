import { VideoData } from '../types';
import { Capacitor } from '@capacitor/core';
import { 
    MOCK_VIDEOS, 
    MOCK_TIKTOK_VIDEOS, 
    MOCK_RUMBLE_VIDEOS, 
    MOCK_PEERTUBE_VIDEOS 
} from '../constants';

// --- CONFIGURATION ---

// 1. YouTube/Piped Instances (High Availability)
// Mixed list of stable instances. If one returns 403/429, we rotate to the next.
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.vic.click',
  'https://piped-api.garudalinux.org',
  'https://pipedapi.drgns.space',
  'https://pa.il.ax',
  'https://pipedapi.system41.site',
  'https://api.piped.privacy.com.de'
];

// 2. PeerTube Search API
const PEERTUBE_SEARCH_API = 'https://sepiasearch.org/api/v1/search/videos';

// 3. Dailymotion API
const DM_API_BASE = 'https://api.dailymotion.com';

// 4. CORS Proxy (Web Fallback Only)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// State for Instance Rotation
let activeInstanceIndex = 0;

// --- HELPERS ---

const formatViews = (views: number): string => {
  if (!views) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

const formatDuration = (seconds: number): string => {
  if (!seconds) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * Native-First HTTP Fetcher
 * Prioritizes CapacitorHttp to bypass CORS on Android/iOS.
 */
async function nativeFetch(url: string) {
    const isNative = Capacitor.isNativePlatform();

    // 1. NATIVE MODE (Android/iOS)
    if (isNative) {
        const CapacitorHttp = (window as any).Capacitor?.Plugins?.CapacitorHttp;
        if (CapacitorHttp) {
            try {
                // console.debug(`[NativeHTTP] GET ${url}`);
                const response = await CapacitorHttp.get({ 
                    url: url,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
                    }
                });
                
                if (response.status >= 200 && response.status < 300) {
                    return response.data;
                }
                throw new Error(`Native HTTP Error: ${response.status}`);
            } catch (e) {
                throw e; // Propagate for rotation logic
            }
        }
    }

    // 2. WEB PREVIEW MODE
    // Attempt direct fetch, then proxy. If both fail, we throw so the specific service can fallback to Mocks.
    try {
        const res = await fetch(url);
        if (res.ok) return await res.json();
        throw new Error(`Direct fetch failed: ${res.status}`);
    } catch (e) {
        // Try Proxy as last resort for Web
        try {
            const proxyUrl = `${CORS_PROXY}${url}`;
            const res = await fetch(proxyUrl);
            if (res.ok) return await res.json();
        } catch (proxyErr) {
             // console.warn("Web fetch failed, falling back to mocks.");
        }
        throw new Error("Web Fetch Failed");
    }
}

/**
 * Resilient Fetcher with Auto-Rotation
 * Automatically retries with different instances on failure.
 */
async function fetchWithRotation(path: string) {
  let attempts = 0;
  // Try up to 3 different instances before giving up
  const maxAttempts = 3; 

  while (attempts < maxAttempts) {
    const currentIndex = (activeInstanceIndex + attempts) % PIPED_INSTANCES.length;
    const instance = PIPED_INSTANCES[currentIndex];
    const url = `${instance}${path}`;

    try {
      const data = await nativeFetch(url);
      
      // If successful and we rotated, update the active index for future calls
      if (activeInstanceIndex !== currentIndex) {
          activeInstanceIndex = currentIndex;
      }
      return data;
    } catch (e) {
      attempts++;
    }
  }

  throw new Error('All API instances failed.');
}

// --- SERVICE EXPORT ---

export const streamService = {
  
  /**
   * Get Trending Videos (Platform Aware)
   */
  async getTrending(platform: string, country: string = 'US'): Promise<VideoData[]> {
    const isNative = Capacitor.isNativePlatform();
    
    try {
      // --- YOUTUBE ---
      if (platform === 'YouTube' || platform === 'All') {
        const data = await fetchWithRotation(`/trending?region=${country}`);
        
        return data.map((v: any) => ({
           id: v.url.split('v=')[1],
           title: v.title,
           uploader: v.uploaderName,
           views: formatViews(v.views),
           date: v.uploadedDate || 'Recently',
           duration: formatDuration(v.duration),
           thumbnail: v.thumbnail,
           platform: 'YouTube',
           avatar: v.uploaderAvatar,
           isShort: v.isShort
        }));
      }

      // --- DAILYMOTION ---
      if (platform === 'Dailymotion') {
         const url = `${DM_API_BASE}/videos?flags=no_live,no_premium&fields=id,title,owner.username,views_total,created_time,duration,thumbnail_720_url,owner.avatar_80_url&sort=trending&limit=20&country=${country}`;
         const data = await nativeFetch(url);
         return mapDmData(data);
      }

      // --- PEERTUBE ---
      if (platform === 'PeerTube') {
          const url = `${PEERTUBE_SEARCH_API}?sort=-publishedAt&nsfw=false&count=10`;
          const data = await nativeFetch(url);
          return mapPeerTubeData(data);
      }

      // --- TIKTOK & RUMBLE (Native RSS or Mock) ---
      if (platform === 'TikTok') return MOCK_TIKTOK_VIDEOS;
      if (platform === 'Rumble') return MOCK_RUMBLE_VIDEOS;
      if (platform === 'Bandcamp') return []; // Placeholder
      
      // Default Fallback
      return MOCK_VIDEOS;

    } catch (error) {
      // SILENT FALLBACK TO MOCKS (For Web Preview or Offline)
      // Do not show error screens to the user.
      if (!isNative) {
          if (platform === 'TikTok') return MOCK_TIKTOK_VIDEOS;
          if (platform === 'Rumble') return MOCK_RUMBLE_VIDEOS;
          if (platform === 'PeerTube') return MOCK_PEERTUBE_VIDEOS;
          
          // Return generic mocks after a simulated delay
          return new Promise(resolve => {
              setTimeout(() => resolve(MOCK_VIDEOS), 800);
          });
      }
      
      // If Native fails completely, return empty list (UI shows empty state) rather than crashing
      console.error(`[StreamService] Trending Error:`, error);
      return [];
    }
  },

  /**
   * Universal Search Router
   */
  async search(query: string, platform: string): Promise<VideoData[]> {
    const isNative = Capacitor.isNativePlatform();

    try {
        // --- YOUTUBE ---
        if (platform === 'YouTube' || platform === 'All') {
            const data = await fetchWithRotation(`/search?q=${encodeURIComponent(query)}&filter=all`);
            return data.items
                .filter((i: any) => i.type === 'stream')
                .map((v: any) => ({
                    id: v.url.split('v=')[1],
                    title: v.title,
                    uploader: v.uploaderName,
                    views: formatViews(v.views),
                    date: v.uploadedDate || 'Recently',
                    duration: formatDuration(v.duration),
                    thumbnail: v.thumbnail,
                    platform: 'YouTube',
                    avatar: v.uploaderAvatar,
                    isShort: v.isShort
                }));
        }

        // --- DAILYMOTION ---
        if (platform === 'Dailymotion') {
            const url = `${DM_API_BASE}/videos?flags=no_live,no_premium&fields=id,title,owner.username,views_total,created_time,duration,thumbnail_720_url,owner.avatar_80_url&limit=20&search=${encodeURIComponent(query)}`;
            const data = await nativeFetch(url);
            return mapDmData(data);
        }

        // --- PEERTUBE ---
        if (platform === 'PeerTube') {
            const url = `${PEERTUBE_SEARCH_API}?search=${encodeURIComponent(query)}&count=20&sort=-match`;
            const data = await nativeFetch(url);
            return mapPeerTubeData(data);
        }

        // --- MOCK FALLBACKS FOR SCRAPER PLATFORMS ---
        if (platform === 'TikTok') {
             return MOCK_TIKTOK_VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()) || query.length < 3);
        }
        if (platform === 'Rumble') {
             return MOCK_RUMBLE_VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()) || query.length < 3);
        }

        return MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));

    } catch (error) {
        // SILENT FALLBACK TO MOCKS
        if (!isNative) {
            return new Promise(resolve => {
                setTimeout(() => {
                   let results: VideoData[] = [];
                   if (platform === 'TikTok') results = MOCK_TIKTOK_VIDEOS;
                   else if (platform === 'Rumble') results = MOCK_RUMBLE_VIDEOS;
                   else if (platform === 'PeerTube') results = MOCK_PEERTUBE_VIDEOS;
                   else results = MOCK_VIDEOS;
                   
                   // Filter mocks
                   const filtered = results.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
                   resolve(filtered.length > 0 ? filtered : results);
                }, 800);
            });
        }
        console.error(`[StreamService] Search Error:`, error);
        return [];
    }
  },

  /**
   * Get Search Suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
      if (!query) return [];
      try {
          const data = await fetchWithRotation(`/suggestions?query=${encodeURIComponent(query)}`);
          return data;
      } catch (e) {
          return [];
      }
  },

  /**
   * Get Direct Stream URL
   */
  async getStreamUrl(id: string, platform: string): Promise<string | null> {
      // 1. YouTube (Piped)
      if (platform === 'YouTube') {
          try {
              const data = await fetchWithRotation(`/streams/${id}`);
              
              if (data.hls) return data.hls;
              
              const streams = data.videoStreams || [];
              const bestStream = streams.find((s: any) => s.quality === '1080p' && s.videoOnly === false) 
                              || streams.find((s: any) => s.quality === '720p' && s.videoOnly === false)
                              || streams.find((s: any) => s.videoOnly === false); 
              
              return bestStream ? bestStream.url : null;
          } catch (e) {
              return null;
          }
      }
      
      // 2. Dailymotion
      if (platform === 'Dailymotion') {
          return `https://www.dailymotion.com/embed/video/${id}?autoplay=1`;
      }

      // 3. Mocks (TikTok, Rumble, etc)
      // Check if ID matches a known mock and return its streamUrl
      const allMocks = [...MOCK_TIKTOK_VIDEOS, ...MOCK_RUMBLE_VIDEOS, ...MOCK_PEERTUBE_VIDEOS, ...MOCK_VIDEOS];
      const match = allMocks.find(v => v.id === id);
      if (match && match.streamUrl) {
          return match.streamUrl;
      }
      
      // Fallback sample
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  }
};

// --- DATA MAPPERS ---

function mapDmData(data: any): VideoData[] {
    if (!data || !data.list) return [];
    return data.list.map((v: any) => ({
        id: v.id,
        title: v.title,
        uploader: v.owner ? v.owner.username : 'Unknown',
        views: formatViews(v.views_total),
        date: 'Recently',
        duration: formatDuration(v.duration),
        thumbnail: v.thumbnail_720_url,
        platform: 'Dailymotion',
        avatar: v.owner ? v.owner.avatar_80_url : ''
    }));
}

function mapPeerTubeData(data: any): VideoData[] {
    if (!data || !data.data) return [];
    return data.data.map((v: any) => ({
        id: v.uuid || v.id.toString(),
        title: v.name || v.option?.name,
        uploader: v.account?.name || 'PeerTube User',
        views: formatViews(v.views),
        date: v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : 'Recently',
        duration: formatDuration(v.duration),
        thumbnail: v.thumbnailUrl || (v.previewPath ? `https://sepiasearch.org${v.previewPath}` : ''),
        platform: 'PeerTube',
        avatar: '',
        streamUrl: v.embedPath
    }));
}