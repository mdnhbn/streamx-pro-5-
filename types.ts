
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'bn';

export enum ViewState {
  HOME = 'HOME',
  TRENDING = 'TRENDING',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  LIBRARY = 'LIBRARY',
  PLAYER = 'PLAYER',
  SEARCH = 'SEARCH',
  SETTINGS_PRIVACY = 'SETTINGS_PRIVACY',
  LIVE_SPORTS = 'LIVE_SPORTS'
}

export interface VideoData {
  id: string;
  title: string;
  uploader: string;
  views: string;
  date: string;
  duration: string;
  thumbnail: string;
  platform: 'YouTube' | 'TikTok' | 'Rumble' | 'Dailymotion' | 'SoundCloud' | 'BiliBili' | 'PeerTube' | 'Bandcamp';
  avatar: string;
  country?: string;
  streamUrl?: string; // Direct URL for playback
  isShort?: boolean;
}

export interface PlatformItem {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
}

export interface AdBannerProps {
  isPro: boolean;
  position: 'bottom' | 'inline';
}

export interface UserSettings {
  country: string;
  language: Language;
  incognito: boolean;
}
