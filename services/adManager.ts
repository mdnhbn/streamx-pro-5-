class AdManager {
  private videoPlayCount = 0;
  private readonly INTERSTITIAL_THRESHOLD = 3;

  /**
   * Increments the play counter and checks if an interstitial should be shown.
   * Returns true if ad should be shown.
   */
  checkAndIncrement(): boolean {
    this.videoPlayCount++;
    console.log(`AdManager: Video play count ${this.videoPlayCount}`);
    if (this.videoPlayCount > 0 && this.videoPlayCount % this.INTERSTITIAL_THRESHOLD === 0) {
      return true;
    }
    return false;
  }

  getNetworks() {
    return ['AdMob', 'Unity Ads', 'Adsterra', 'Advertica', 'Moneytag'];
  }
}

export const adManager = new AdManager();