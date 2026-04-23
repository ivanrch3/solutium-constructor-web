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

  /**
   * Inicializa la configuración con valores de entorno (build-time)
   * como fallback inicial.
   */
  constructor() {
    // Intentar cargar de Vite
    this.config.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    this.config.pexelsApiKey = import.meta.env.VITE_PEXELS_API_KEY || null;
    
    // Intentar cargar de process.env (inyectado por vite define)
    try {
      if (!this.config.geminiApiKey && typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
        this.config.geminiApiKey = process.env.GEMINI_API_KEY;
      }
    } catch(e) {}
  }

  /**
   * Actualiza la configuración en caliente (por ejemplo, desde el Handshake)
   */
  updateConfig(newConfig: Partial<AppConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log("⚙️ [ConfigService] Configuración de runtime actualizada.");
  }

  get geminiApiKey(): string | null {
    return this.config.geminiApiKey;
  }

  get pexelsApiKey(): string | null {
    return this.config.pexelsApiKey;
  }
}

export const configService = new ConfigService();
