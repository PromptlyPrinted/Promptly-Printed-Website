'use client';

import { createContext, useContext, ReactNode } from 'react';

export interface DesignTheme {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;

  // Accent colors
  accent: string;
  accentLight: string;

  // Neutral colors
  textPrimary: string;
  textSecondary: string;
  background: string;
  border: string;
  borderLight: string;

  // Interactive states
  hover: string;
  active: string;

  // Gradients
  gradientFrom: string;
  gradientTo: string;
}

export const themes: Record<string, DesignTheme> = {
  default: {
    primary: 'teal-700',
    primaryHover: 'teal-600',
    primaryLight: 'teal-50',
    primaryDark: 'teal-800',
    accent: 'teal-600',
    accentLight: 'teal-100',
    textPrimary: 'gray-900',
    textSecondary: 'gray-700',
    background: 'white',
    border: 'teal-200',
    borderLight: 'teal-100',
    hover: 'gray-50',
    active: 'teal-50',
    gradientFrom: 'teal-50',
    gradientTo: 'teal-100',
  },
  halloween: {
    primary: 'orange-600',
    primaryHover: 'orange-500',
    primaryLight: 'orange-50',
    primaryDark: 'orange-700',
    accent: 'purple-600',
    accentLight: 'purple-100',
    textPrimary: 'gray-900',
    textSecondary: 'orange-900',
    background: 'white',
    border: 'orange-200',
    borderLight: 'orange-100',
    hover: 'orange-50',
    active: 'orange-100',
    gradientFrom: 'orange-50',
    gradientTo: 'purple-100',
  },
  christmas: {
    primary: 'red-600',
    primaryHover: 'red-500',
    primaryLight: 'red-50',
    primaryDark: 'red-700',
    accent: 'green-600',
    accentLight: 'green-100',
    textPrimary: 'gray-900',
    textSecondary: 'red-900',
    background: 'white',
    border: 'red-200',
    borderLight: 'red-100',
    hover: 'red-50',
    active: 'red-100',
    gradientFrom: 'red-50',
    gradientTo: 'green-100',
  },
};

interface DesignThemeContextType {
  theme: DesignTheme;
  themeName: string;
}

const DesignThemeContext = createContext<DesignThemeContextType>({
  theme: themes.default,
  themeName: 'default',
});

export const useDesignTheme = () => useContext(DesignThemeContext);

interface DesignThemeProviderProps {
  children: ReactNode;
  themeName?: string;
}

export function DesignThemeProvider({ children, themeName = 'default' }: DesignThemeProviderProps) {
  const theme = themes[themeName] || themes.default;

  return (
    <DesignThemeContext.Provider value={{ theme, themeName }}>
      {children}
    </DesignThemeContext.Provider>
  );
}
