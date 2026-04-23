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
    // 1. Intentar cargar de localStorage (Prioridad Máxima - Usuario Manual)
    this.config.geminiApiKey = localStorage.getItem('solutium_ai_key');
    this.config.pexelsApiKey = localStorage.getItem('solutium_pexels_key');

    // 2. Intentar cargar de Vite (Build-time)
    if (!this.config.geminiApiKey) {
      this.config.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    }
    if (!this.config.pexelsApiKey) {
      this.config.pexelsApiKey = import.meta.env.VITE_PEXELS_API_KEY || null;
    }
    
    // 3. Fallback a process.env (Vite Define)
    try {
      if (!this.config.geminiApiKey && typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
        this.config.geminiApiKey = process.env.GEMINI_API_KEY;
      }
    } catch(e) {}
  }

  updateConfig(newConfig: Partial<AppConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Persistir si se recibe de forma explícita
    if (newConfig.geminiApiKey) localStorage.setItem('solutium_ai_key', newConfig.geminiApiKey);
    if (newConfig.pexelsApiKey) localStorage.setItem('solutium_pexels_key', newConfig.pexelsApiKey);

    console.log("⚙️ [ConfigService] Configuración actualizada y persistida.");
  }

  // Permite al usuario borrar la configuración manual
  clearManualConfig() {
    localStorage.removeItem('solutium_ai_key');
    localStorage.removeItem('solutium_pexels_key');
    window.location.reload();
  }

  get geminiApiKey(): string | null {
    return this.config.geminiApiKey;
  }

  get pexelsApiKey(): string | null {
    return this.config.pexelsApiKey;
  }
}

export const configService = new ConfigService();
