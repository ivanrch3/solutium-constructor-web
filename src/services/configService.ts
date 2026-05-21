/**
 * Servicio de Configuración Dinámica (Runtime Config)
 * Soluciona el problema de variables quemadas en el build de Vite.
 */
import { logDebug } from '../utils/debug';

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

  /**
   * Intenta extraer la API Key de Gemini de todas las fuentes posibles:
   * 1. window.name (JSON inyectado por la madre)
   * 2. Parámetros de URL (query string)
   * 3. Variables de entorno (Build-time)
   */
  public refreshConfig() {
    // A. Buscar en window.name
    try {
      if (window.name && window.name.startsWith('{')) {
        const data = JSON.parse(window.name);
        this.extractFromObject(data);
      }
    } catch (e) {}

    // B. Buscar en Parámetros de URL
    const params = new URLSearchParams(window.location.search);
    const urlData = {
      gemini_api_key: params.get('gemini_api_key') || params.get('apiKey')
    };
    this.extractFromObject(urlData);

    // C. Fallback a Variables de Entorno
    if (!this.config.geminiApiKey) {
      this.config.geminiApiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || null;
    }
  }

  private extractFromObject(data: any) {
    if (!data) return;
    
    // Mapeo flexible para Gemini
    const geminiKey = data.gemini_api_key || data.GEMINI_API_KEY || data.apiKey || data.geminiKey || data.VITE_GEMINI_API_KEY;
    if (geminiKey) this.config.geminiApiKey = geminiKey;

  }

  updateConfig(newConfig: Partial<AppConfig>) {
    this.extractFromObject(newConfig);
    logDebug("⚡ [ConfigService] Configuración de runtime sincronizada.");
  }

  get geminiApiKey(): string | null {
    return this.config.geminiApiKey;
  }
}

export const configService = new ConfigService();
