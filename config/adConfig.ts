/**
 * Ad Configuration
 * Paste your Direct Links and IDs here.
 * 
 * Note: For Adsterra and MoneyTag, usually "Direct Links" are used in hybrid apps.
 * For AdMob and Unity, native plugins are typically required, but you can 
 * use these variables to trigger logic in your AdManager.
 */

export const AD_CONFIG = {
  // 1. Primary Direct Link (High Priority)
  // Paste your Adsterra 'Direct Link' URL here
  ADSTERRA_URL: 'https://adsterra.com/', 

  // 2. Secondary Direct Link (Fallback)
  // Paste your MoneyTag/PropellerAds link here
  MONEYTAG_URL: '', 

  // 3. Native IDs (For Plugin Integration)
  ADMOB_BANNER_ID: 'ca-app-pub-0000000000000000/0000000000',
  UNITY_GAME_ID: '0000000',
  
  // Settings
  SHOW_BANNERS: true,
  OPEN_IN_NEW_TAB: true
};