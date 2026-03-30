import React, { createContext, useContext } from 'react';

type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
};

const ThemeRegistry: Record<string, ThemeColors> = {
  'blue-light': {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    background: '#f3f4f6',
    surface: '#ffffff',
    text: '#1f2937',
  },
  'dark-mode': {
    primary: '#6366f1',
    secondary: '#818cf8',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
  },
  'green-light': {
    primary: '#10b981',
    secondary: '#34d399',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#064e3b',
  }
};

interface ThemeContextProps {
  setTheme: (themeName: string, fontFamily: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setTheme = (themeName: string, fontFamily: string) => {
    const theme = ThemeRegistry[themeName] || ThemeRegistry['blue-light'];
    
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-text', theme.text);
    
    root.style.setProperty('--font-family-base', fontFamily || 'Inter, sans-serif');
  };

  return (
    <ThemeContext.Provider value={{ setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
