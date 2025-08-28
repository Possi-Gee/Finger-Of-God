'use client';

import type { Product } from '@/lib/products';
import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';

type WishlistState = {
  items: Product[];
};

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'SET_STATE'; payload: WishlistState };

const initialState: WishlistState = {
  items: [],
};

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    }
    case 'SET_STATE': {
      return action.payload;
    }
    default:
      return state;
  }
};

export type WishlistContextType = {
  state: WishlistState;
  dispatch: React.Dispatch<WishlistAction>;
  isWishlisted: (id: number) => boolean;
};

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('shopwave_wishlist');
      if (storedWishlist) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(storedWishlist) });
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shopwave_wishlist', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save wishlist to localStorage", error);
    }
  }, [state]);

  const isWishlisted = (id: number) => state.items.some(item => item.id === id);

  return (
    <WishlistContext.Provider value={{ state, dispatch, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};
