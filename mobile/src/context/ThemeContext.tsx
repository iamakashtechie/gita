import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  primary: string;
  primaryLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  sanskrit: string;
  border: string;
  accent: string;
}

export const lightTheme: ThemeColors = {
  background: '#FAF7F2',
  cardBackground: '#FFFFFF',
  primary: '#B45309',
  primaryLight: '#FEF3C7',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  sanskrit: '#92400E',
  border: '#E5E7EB',
  accent: '#D97706',
};

export const darkTheme: ThemeColors = {
  background: '#121214',
  cardBackground: '#1C1C22',
  primary: '#F59E0B',
  primaryLight: '#2C2214',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  sanskrit: '#FBBF24',
  border: '#272730',
  accent: '#F59E0B',
};

export type FontSizeMultiplier = 0.9 | 1.0 | 1.15 | 1.3;

interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  fontSizeMultiplier: FontSizeMultiplier;
  setFontSizeMultiplier: (size: FontSizeMultiplier) => void;
  preferredLang: 'english' | 'hindi';
  setPreferredLang: (lang: 'english' | 'hindi') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<FontSizeMultiplier>(1.0);
  const [preferredLang, setPreferredLang] = useState<'english' | 'hindi'>('english');

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const colors = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        colors,
        toggleTheme,
        fontSizeMultiplier,
        setFontSizeMultiplier,
        preferredLang,
        setPreferredLang,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
