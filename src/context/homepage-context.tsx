
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';

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
};

type HomepageAction =
  | { type: 'SET_STATE'; payload: HomepageState }
  | { type: 'UPDATE_CALL_TO_ACTION'; payload: { text: string } }
  | { type: 'UPDATE_PROMOTIONS'; payload: Promotion[] }
  | { type: 'UPDATE_FLASH_SALE'; payload: { endDate: string } };

const initialState: HomepageState = {
  callToAction: { text: 'Call to Order: 030 274 0642' },
  promotions: [
    { 
      id: 1, 
      type: 'welcome', 
      content: 'Welcome to ShopWave!', 
      title: 'Welcome to ShopWave!', 
      subtitle: 'Your one-stop shop for everything you need.',
      buttonText: 'Shop Now',
      buttonLink: '/'
    },
    { id: 2, type: 'image', content: 'https://picsum.photos/1200/400?random=1', alt: 'Promotion 1', dataAiHint: 'sale discount' },
    { id: 3, type: 'image', content: 'https://picsum.photos/1200/400?random=2', alt: 'Promotion 2', dataAiHint: 'new arrivals' },
    { id: 4, type: 'image', content: 'https://picsum.photos/1200/400?random=3', alt: 'Promotion 3', dataAiHint: 'electronics promotion' },
  ],
  flashSale: { endDate: '2024-12-31T23:59' },
};

const homepageReducer = (state: HomepageState, action: HomepageAction): HomepageState => {
  switch (action.type) {
    case 'UPDATE_CALL_TO_ACTION':
      return { ...state, callToAction: action.payload };
    case 'UPDATE_PROMOTIONS':
      return { ...state, promotions: action.payload };
    case 'UPDATE_FLASH_SALE':
        return { ...state, flashSale: action.payload };
    case 'SET_STATE':
      return action.payload;
    default:
      return state;
  }
};

export type HomepageContextType = {
  state: HomepageState;
  dispatch: React.Dispatch<HomepageAction>;
};

export const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

export const HomepageProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(homepageReducer, initialState);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('shopwave_homepage');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        // Basic validation to ensure we don't load corrupted data
        if (parsedState.callToAction && parsedState.promotions && parsedState.flashSale) {
            dispatch({ type: 'SET_STATE', payload: parsedState });
        }
      }
    } catch (error) {
      console.error("Failed to load homepage state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shopwave_homepage', JSON.stringify(state));
    } catch (error)
 {
      console.error("Failed to save homepage state to localStorage", error);
    }
  }, [state]);

  return (
    <HomepageContext.Provider value={{ state, dispatch }}>
      {children}
    </HomepageContext.Provider>
  );
};
