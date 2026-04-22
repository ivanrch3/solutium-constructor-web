
export interface AIGenerationContext {
  siteName: string;
  industry: string;
  description: string;
  goal: string;
  style: string;
  brandColors: string[];
}

export interface AISectionResult {
  moduleId: string;
  settingsValues: Record<string, any>;
  imageQueries?: Record<string, string>;
  aiImagePrompt?: string;
}

export interface AIGenerationResult {
  theme: {
    fontSans: string;
    fontDisplay: string;
    borderRadius: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
  sections: AISectionResult[];
}

export interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}
