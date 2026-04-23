/**
 * Servicio de Configuración Dinámica (Runtime Config)
 * Soluciona el problema de variables quemadas en el build de Vite.
 */

interface AppConfig {
  geminiApiKey: string | null;
  pexelsApiKey: string | null;
}

class ConfigService {
  private config: AppConfig = {
    geminiApiKey: null,
    pexelsApiKey: null
  };

  constructor() {
    this.refreshConfig();
  }

  /**
   * Intenta extraer las API Keys de todas las fuentes posibles:
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
      gemini_api_key: params.get('gemini_api_key') || params.get('apiKey'),
      pexels_api_key: params.get('pexels_api_key') || params.get('pexelsKey')
    };
    this.extractFromObject(urlData);

    // C. Fallback a Variables de Entorno
    if (!this.config.geminiApiKey) {
      this.config.geminiApiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || null;
    }
    if (!this.config.pexelsApiKey) {
      this.config.pexelsApiKey = (import.meta.env.VITE_PEXELS_API_KEY as string) || null;
    }
  }

  private extractFromObject(data: any) {
    if (!data) return;
    
    // Mapeo flexible para Gemini
    const geminiKey = data.gemini_api_key || data.GEMINI_API_KEY || data.apiKey || data.geminiKey || data.VITE_GEMINI_API_KEY;
    if (geminiKey) this.config.geminiApiKey = geminiKey;

    // Mapeo flexible para Pexels
    const pexelsKey = data.pexels_api_key || data.PEXELS_API_KEY || data.pexelsKey || data.VITE_PEXELS_API_KEY;
    if (pexelsKey) this.config.pexelsApiKey = pexelsKey;
  }

  updateConfig(newConfig: Partial<AppConfig>) {
    this.extractFromObject(newConfig);
    console.log("⚡ [ConfigService] Configuración de runtime sincronizada.");
  }

  get geminiApiKey(): string | null {
    return this.config.geminiApiKey;
  }

  get pexelsApiKey(): string | null {
    return this.config.pexelsApiKey;
  }
}

export const configService = new ConfigService();
