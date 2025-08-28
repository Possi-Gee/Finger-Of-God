
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';

type Link = { id: number; label: string; url: string };
type FooterColumn = { id: number; title: string; links: Link[] };

export type SiteSettingsState = {
  appName: string;
  theme: {
    background: string;
    foreground: string;
    primary: string;
    'primary-foreground': string;
    accent: string;
    'accent-foreground': string;
    card: string;
    'card-foreground': string;
    border: string;
    input: string;
    ring: string;
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
    background: '197 93% 94%',
    foreground: '222 47% 11%',
    card: '0 0% 100%',
    'card-foreground': '222 47% 11%',
    primary: '197 78% 52%',
    'primary-foreground': '0 0% 98%',
    accent: '291 64% 42%',
    'accent-foreground': '0 0% 98%',
    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    ring: "197 78% 52%",
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
