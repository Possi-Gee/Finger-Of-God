
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface Promotion {
  id: number;
  type: 'image' | 'welcome';
  content: string; // URL for image, text for welcome
  alt?: string;
  dataAiHint?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export type HomepageState = {
  callToAction: {
    text: string;
  };
  promotions: Promotion[];
  flashSale: {
    endDate: string;
  };
  loading: boolean;
};

type HomepageAction =
  | { type: 'SET_STATE'; payload: Partial<HomepageState> }
  | { type: 'UPDATE_HOMEPAGE'; payload: Partial<Omit<HomepageState, 'loading'>> };


const initialState: HomepageState = {
  callToAction: { text: 'Call to Order: 030 274 0642' },
  promotions: [
    { 
      id: 1, 
      type: 'welcome', 
      content: 'Welcome to Jaytel Classic Store!', 
      title: 'Welcome to Jaytel Classic Store!', 
      subtitle: 'Your one-stop shop for everything you need.',
      buttonText: 'Shop Now',
      buttonLink: '/'
    },
    { id: 2, type: 'image', content: 'https://picsum.photos/1200/400?random=1', alt: 'Promotion 1', dataAiHint: 'sale discount' },
    { id: 3, type: 'image', content: 'https://picsum.photos/1200/400?random=2', alt: 'Promotion 2', dataAiHint: 'new arrivals' },
    { id: 4, type: 'image', content: 'https://picsum.photos/1200/400?random=3', alt: 'Promotion 3', dataAiHint: 'electronics promotion' },
  ],
  flashSale: { endDate: '2024-12-31T23:59' },
  loading: true,
};

const homepageReducer = (state: HomepageState, action: HomepageAction): HomepageState => {
  switch (action.type) {
    case 'UPDATE_HOMEPAGE':
      return { ...state, ...action.payload };
    case 'SET_STATE':
      return { ...state, ...action.payload, loading: false };
    default:
      return state;
  }
};

export type HomepageContextType = {
  state: HomepageState;
  dispatch: React.Dispatch<HomepageAction>;
  updateHomepage: (newHomepage: Partial<Omit<HomepageState, 'loading'>>) => Promise<void>;
};

export const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

export const HomepageProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(homepageReducer, initialState);
  
  const homepageDocRef = doc(db, 'site', 'homepage');

  useEffect(() => {
    const unsubscribe = onSnapshot(homepageDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data() as Partial<HomepageState>;
            dispatch({ type: 'SET_STATE', payload: data });
        } else {
            // If no settings in DB, use initial state and set loading to false
            dispatch({ type: 'SET_STATE', payload: {} });
        }
    }, (error) => {
        console.error("Error fetching homepage settings:", error);
        // On error, use initial state
        dispatch({ type: 'SET_STATE', payload: {} });
    });

    return () => unsubscribe();
  }, []);

  const updateHomepage = async (newHomepage: Partial<Omit<HomepageState, 'loading'>>) => {
      try {
          await setDoc(homepageDocRef, newHomepage, { merge: true });
      } catch (error) {
          console.error("Failed to update homepage settings:", error);
          throw error;
      }
  };

  return (
    <HomepageContext.Provider value={{ state, dispatch, updateHomepage }}>
      {!state.loading ? children : null}
    </HomepageContext.Provider>
  );
};
