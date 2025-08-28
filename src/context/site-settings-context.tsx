
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';

type ThemeColor = { h: number; s: number; l: number };

type Link = { id: number; label: string; url: string };
type FooterColumn = { id: number; title: string; links: Link[] };

export type SiteSettingsState = {
  appName: string;
  theme: {
    background: ThemeColor;
    foreground: ThemeColor;
    primary: ThemeColor;
    'primary-foreground': ThemeColor;
    accent: ThemeColor;
    'accent-foreground': ThemeColor;
    card: ThemeColor;
  };
  footer: {
    columns: FooterColumn[];
    socialLinks: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  };
};

type SiteSettingsAction =
  | { type: 'SET_STATE'; payload: SiteSettingsState }
  | { type: 'UPDATE_SETTINGS'; payload: SiteSettingsState };

const initialState: SiteSettingsState = {
  appName: 'ShopWave',
  theme: {
    background: { h: 197, s: 93, l: 94 },
    foreground: { h: 222, s: 47, l: 11 },
    card: { h: 197, s: 93, l: 98 },
    primary: { h: 197, s: 78, l: 52 },
    'primary-foreground': { h: 0, s: 0, l: 98 },
    accent: { h: 291, s: 64, l: 42 },
    'accent-foreground': { h: 0, s: 0, l: 98 },
  },
  footer: {
    columns: [
      {
        id: 1,
        title: 'Shop',
        links: [
          { id: 1, label: 'Electronics', url: '#' },
          { id: 2, label: 'Fashion', url: '#' },
          { id: 3, label: 'Home Goods', url: '#' },
          { id: 4, label: 'Groceries', url: '#' },
        ],
      },
      {
        id: 2,
        title: 'Support',
        links: [
          { id: 1, label: 'Contact Us', url: '#' },
          { id: 2, label: 'FAQ', url: '#' },
          { id: 3, label: 'Shipping & Returns', url: '#' },
          { id: 4, label: 'Track Order', url: '#' },
        ],
      },
       {
        id: 3,
        title: 'Company',
        links: [
          { id: 1, label: 'About Us', url: '#' },
          { id: 2, label: 'Careers', url: '#' },
          { id: 3, label: 'Press', url: '#' },
          { id: 4, label: 'Terms of Service', url: '#' },
        ],
      },
    ],
    socialLinks: {
        twitter: '#',
        facebook: '#',
        instagram: '#'
    }
  },
};

const settingsReducer = (state: SiteSettingsState, action: SiteSettingsAction): SiteSettingsState => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return { ...state, ...action.payload };
    case 'SET_STATE':
      return action.payload;
    default:
      return state;
  }
};

export type SiteSettingsContextType = {
  state: SiteSettingsState;
  dispatch: React.Dispatch<SiteSettingsAction>;
};

export const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('shopwave_settings');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        // Basic validation
        if (parsedState.appName && parsedState.theme && parsedState.footer) {
            dispatch({ type: 'SET_STATE', payload: parsedState });
        }
      }
    } catch (error) {
      console.error("Failed to load site settings from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shopwave_settings', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save site settings to localStorage", error);
    }
  }, [state]);

  return (
    <SiteSettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
