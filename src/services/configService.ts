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
    // 1. Intentar cargar de window.name (Zero-latency injection de la Madre)
    try {
      if (window.name) {
        const data = JSON.parse(window.name);
        if (data.gemini_api_key) this.config.geminiApiKey = data.gemini_api_key;
        if (data.pexels_api_key) this.config.pexelsApiKey = data.pexels_api_key;
        if (this.config.geminiApiKey) console.log("🚀 [ConfigService] Llave Gemini inyectada por window.name");
      }
    } catch (e) {
      // Ignorar errores de parseo si window.name no es JSON
    }

    // 2. Fallback a variables de entorno si la Madre no inyectó nada
    if (!this.config.geminiApiKey) {
      this.config.geminiApiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || null;
    }
    if (!this.config.pexelsApiKey) {
      this.config.pexelsApiKey = (import.meta.env.VITE_PEXELS_API_KEY as string) || null;
    }
  }

  updateConfig(newConfig: Partial<AppConfig>) {
    this.config = { ...this.config, ...newConfig };
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
