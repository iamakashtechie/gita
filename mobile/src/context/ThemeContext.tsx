import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  surfaceElevated: string;
  primary: string;
  primaryLight: string;
  primaryHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  sanskrit: string;
  sanskritSubtle: string;
  border: string;
  borderSubtle: string;
  accent: string;
  gold: string;
  goldLight: string;
  pillBg: string;
  pillActive: string;
}

export const lightTheme: ThemeColors = {
  background: '#FAF8F5',
  cardBackground: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  primary: '#C25E00',
  primaryLight: '#FFF4E6',
  primaryHover: '#A85100',
  textPrimary: '#1F1E1B',
  textSecondary: '#5C5852',
  textMuted: '#9E988F',
  sanskrit: '#943E00',
  sanskritSubtle: '#B85300',
  border: '#EFEBE4',
  borderSubtle: '#F3EFE9',
  accent: '#D97706',
  gold: '#D97706',
  goldLight: '#FEF3C7',
  pillBg: '#F3EFE9',
  pillActive: '#C25E00',
};

export const darkTheme: ThemeColors = {
  background: '#0F0F12',
  cardBackground: '#18181D',
  surfaceElevated: '#202028',
  primary: '#FB923C',
  primaryLight: 'rgba(251, 146, 60, 0.12)',
  primaryHover: '#F97316',
  textPrimary: '#F5F3EF',
  textSecondary: '#A39F99',
  textMuted: '#6B6760',
  sanskrit: '#FBBF24',
  sanskritSubtle: '#F59E0B',
  border: '#2A2A33',
  borderSubtle: '#22222B',
  accent: '#F59E0B',
  gold: '#F59E0B',
  goldLight: 'rgba(245, 158, 11, 0.15)',
  pillBg: '#22222B',
  pillActive: '#FB923C',
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
