'use client';

import React, { createContext, useReducer, useEffect, type ReactNode, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

type Link = { id: number; label: string; url: string };
type FooterColumn = { id: number; title: string; links: Link[] };

export type SiteTheme = {
  background: string;
  foreground: string;
  primary: string;
  'primary-foreground': string;
  accent: string;
  'accent-foreground': string;
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  border: string;
  input: string;
  ring: string;
};

export type FooterSettings = {
  columns: FooterColumn[];
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
};


export type SiteSettingsState = {
  appName: string;
  logoUrl: string;
  fromEmail: string;
  taxRate: number;
  shippingFee: number;
  theme: SiteTheme;
  footer: FooterSettings;
  loading: boolean;
};

type SiteSettingsAction =
  | { type: 'SET_STATE'; payload: Partial<SiteSettingsState> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Omit<SiteSettingsState, 'loading'>> };


const initialState: SiteSettingsState = {
  appName: 'ShopWave',
  logoUrl: '',
  fromEmail: 'onboarding@resend.dev',
  taxRate: 8,
  shippingFee: 5,
  theme: {
    background: '197 93% 94%',
    foreground: '222 47% 11%',
    card: '0 0% 100%',
    'card-foreground': '222 47% 11%',
    popover: '0 0% 100%',
    'popover-foreground': '222 47% 11%',
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
  loading: true,
};

const settingsReducer = (state: SiteSettingsState, action: SiteSettingsAction): SiteSettingsState => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
       return { ...state, ...action.payload };
    case 'SET_STATE':
      return { ...state, ...action.payload, loading: false };
    default:
      return state;
  }
};

export type SiteSettingsContextType = {
  state: SiteSettingsState;
  dispatch: React.Dispatch<SiteSettingsAction>;
  updateSettings: (newSettings: Partial<Omit<SiteSettingsState, 'loading'>>) => Promise<void>;
};

export const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  
  const settingsDocRef = doc(db, 'site', 'settings');

  useEffect(() => {
    const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data() as Partial<SiteSettingsState>;
            dispatch({ type: 'SET_STATE', payload: data });
        } else {
            // If no settings in DB, use initial state and set loading to false
            dispatch({ type: 'SET_STATE', payload: {} });
        }
    }, (error) => {
        console.error("Error fetching site settings:", error);
        // On error, use initial state
        dispatch({ type: 'SET_STATE', payload: {} });
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<Omit<SiteSettingsState, 'loading'>>) => {
      try {
          await setDoc(settingsDocRef, newSettings, { merge: true });
          // The onSnapshot listener will automatically update the state,
          // so we don't need to dispatch here.
      } catch (error) {
          console.error("Failed to update site settings:", error);
          // Optionally re-throw or handle the error in the UI
          throw error;
      }
  };


  return (
    <SiteSettingsContext.Provider value={{ state, dispatch, updateSettings }}>
      {!state.loading ? children : null}
    </SiteSettingsContext.Provider>
  );
};
