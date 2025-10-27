
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';


export type Link = { id: number; label: string; url: string };
export type FooterColumn = { id: number; title: string; links: Link[] };

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
  adminEmail: string;
  adminPhone: string;
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
  appName: 'Jaytel Classic Store',
  logoUrl: '',
  fromEmail: 'onboarding@resend.dev',
  adminEmail: 'admin@jaytelclassic.com',
  adminPhone: '+233 30 274 0642',
  taxRate: 8,
  shippingFee: 5,
  theme: {
    background: '330 100% 98%',
    foreground: '285 25% 20%',
    card: '0 0% 100%',
    'card-foreground': '285 25% 20%',
    popover: '0 0% 100%',
    'popover-foreground': '285 25% 20%',
    primary: '285 43% 30%',
    'primary-foreground': '0 0% 98%',
    accent: '339 83% 52%',
    'accent-foreground': '0 0% 98%',
    border: "330 30% 90%",
    input: "330 30% 90%",
    ring: "339 83% 52%",
  },
  footer: {
    columns: [
      {
        id: 2,
        title: 'Support',
        links: [
          { id: 1, label: 'Contact Us', url: '/contact' },
          { id: 2, label: 'FAQ', url: '/faq' },
          { id: 3, label: 'Shipping & Returns', url: '/shipping-returns' },
          { id: 4, label: 'Track Order', url: '/orders' },
        ],
      },
       {
        id: 3,
        title: 'Company',
        links: [
          { id: 1, label: 'About Us', url: '/about' },
          { id: 2, label: 'Careers', url: '/careers' },
          { id: 3, label: 'Press', url: '/press' },
          { id: 4, label: 'Terms of Service', url: '/terms-of-service' },
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
        dispatch({ type: 'SET_STATE', payload: {} }); // Stop loading on error
        const permissionError = new FirestorePermissionError({
          path: settingsDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
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
      {children}
    </SiteSettingsContext.Provider>
  );
};
