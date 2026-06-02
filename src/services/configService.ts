import { logDebug } from '../utils/debug';
import { getLaunchTokenFromUrl } from './secureLaunchSession';

interface AppConfig {
  geminiApiKey: string | null;
}

class ConfigService {
  private config: AppConfig = {
    geminiApiKey: null
  };

  constructor() {
    this.refreshConfig();
  }

  public refreshConfig() {
    const hasSecureLaunchToken = Boolean(getLaunchTokenFromUrl());

    if (!hasSecureLaunchToken) {
      try {
        if (window.name && window.name.startsWith('{')) {
          const data = JSON.parse(window.name);
          this.extractFromObject(data);
        }
      } catch {
        // Legacy runtime config is best-effort only.
      }

      const params = new URLSearchParams(window.location.search);
      this.extractFromObject({
        gemini_api_key: params.get('gemini_api_key') || params.get('apiKey')
      });
    }

    if (!this.config.geminiApiKey) {
      this.config.geminiApiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || null;
    }
  }

  private extractFromObject(data: any) {
    if (!data) return;

    const geminiKey =
      data.gemini_api_key ||
      data.GEMINI_API_KEY ||
      data.apiKey ||
      data.geminiKey ||
      data.VITE_GEMINI_API_KEY;

    if (geminiKey) this.config.geminiApiKey = geminiKey;
  }

  updateConfig(newConfig: Partial<AppConfig>) {
    this.extractFromObject(newConfig);
    logDebug('[ConfigService] Runtime config synchronized.');
  }

  get geminiApiKey(): string | null {
    return this.config.geminiApiKey;
  }
}

export const configService = new ConfigService();
