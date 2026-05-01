export type VisualStyle = 
  | 'Moderno' 
  | 'Elegante' 
  | 'Divertido' 
  | 'Minimalista' 
  | 'Corporativo' 
  | 'Creativo' 
  | 'Clásico' 
  | 'Atrevido';

export type PropertyPillar = 
  | 'content' 
  | 'structure' 
  | 'style' 
  | 'typography' 
  | 'multimedia' 
  | 'interaction';

export interface PropertyField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'toggle' | 'slider' | 'image' | 'icon';
  pillar: PropertyPillar;
  options?: { label: string; value: string }[]; // Para selects
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface ModuleElement {
  id: string;
  name: string;
  type: string;
  fields: PropertyField[];
}

export interface Section {
  id: string;
  type: string;
  name: string;
  templateId?: string;
  elements: ModuleElement[];
  settings: Record<string, any>;
  moduleId?: string;
  settingsValues?: Record<string, any>;
}

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
  backgroundColor: string;
  textColor: string;
  accentColor?: string;
  fontSans?: string;
  fontDisplay?: string;
  // Global Settings
  alternatingDarkMode?: boolean;
  alternatingThemeMode?: boolean;
  themeBackgroundColor?: string;
  globalAnimationType?: string;
  invertedAlternatingMode?: boolean;
}

export interface SiteContent {
  theme: Theme;
  sections: Section[];
}

export interface SiteMetadata {
  appId: string;
  siteId: string;
  siteName: string;
  isActive: boolean;
}

export interface SIPResponse {
  success: boolean;
  message: string;
  data?: any;
}
