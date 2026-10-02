/**
 * ANTWRE — Privacy, Consent & Anonymous Telemetry Manager
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements strict zero-PII privacy principles:
 * - No collection of names, email addresses, IP addresses, or device fingerprints.
 * - Anonymous randomly generated session tokens stored in localStorage.
 * - Clear opt-out controls for non-essential community telemetry.
 */

export interface PrivacyPreferences {
  analyticsOptOut: boolean;
  communitySyncEnabled: boolean;
  anonymousSessionId: string;
  consentTimestamp: number;
}

export class PrivacyManager {
  private static readonly STORAGE_KEY = 'antwire_privacy_prefs_v1';
  private static instance: PrivacyManager;
  private prefs: PrivacyPreferences;

  private constructor() {
    this.prefs = this.loadPreferences();
  }

  public static getInstance(): PrivacyManager {
    if (!PrivacyManager.instance) {
      PrivacyManager.instance = new PrivacyManager();
    }
    return PrivacyManager.instance;
  }

  private loadPreferences(): PrivacyPreferences {
    try {
      const raw = localStorage.getItem(PrivacyManager.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.anonymousSessionId && typeof parsed.analyticsOptOut === 'boolean') {
          return parsed;
        }
      }
    } catch {
      // Storage unavailable or blocked
    }

    const initial: PrivacyPreferences = {
      analyticsOptOut: false,
      communitySyncEnabled: true,
      anonymousSessionId: this.generateAnonymousSessionId(),
      consentTimestamp: Date.now(),
    };

    this.savePreferences(initial);
    return initial;
  }

  private savePreferences(prefs: PrivacyPreferences): void {
    try {
      localStorage.setItem(PrivacyManager.STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Storage write failed
    }
  }

  /**
   * Generates a completely anonymous, non-fingerprinting v4-like UUID.
   */
  private generateAnonymousSessionId(): string {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `anon-${s4()}${s4()}-${s4()}-4${s4().substr(0, 3)}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  public getSessionId(): string {
    return this.prefs.anonymousSessionId;
  }

  public getAnonymousSessionId(): string {
    return this.prefs.anonymousSessionId;
  }

  public isAnalyticsAllowed(): boolean {
    return !this.prefs.analyticsOptOut;
  }

  public isOptedOut(): boolean {
    return this.prefs.analyticsOptOut;
  }

  public isCommunitySyncAllowed(): boolean {
    return this.prefs.communitySyncEnabled;
  }

  public setAnalyticsOptOut(optOut: boolean): void {
    this.prefs.analyticsOptOut = optOut;
    this.savePreferences(this.prefs);
  }

  public setOptOut(optOut: boolean): void {
    this.setAnalyticsOptOut(optOut);
  }

  public setCommunitySync(enabled: boolean): void {
    this.prefs.communitySyncEnabled = enabled;
    this.savePreferences(this.prefs);
  }

  public resetSessionId(): string {
    this.prefs.anonymousSessionId = this.generateAnonymousSessionId();
    this.savePreferences(this.prefs);
    return this.prefs.anonymousSessionId;
  }

  public getPreferences(): PrivacyPreferences {
    return { ...this.prefs };
  }
}

export const privacyManager = PrivacyManager.getInstance();
