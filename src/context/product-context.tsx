
'use client';

import type { Product } from '@/lib/products';
import { products as initialProducts } from '@/lib/products';
import React, { createContext, useReducer, useEffect, type ReactNode, useState } from 'react';

type ProductState = {
  products: Product[];
};

type ProductAction =
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: { id: number } }
  | { type: 'SET_STATE'; payload: ProductState };

const initialState: ProductState = {
  products: initialProducts,
};

const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      return {
        ...state,
        products: [action.payload, ...state.products],
      };
    }
     case 'UPDATE_PRODUCT': {
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p),
      };
    }
    case 'DELETE_PRODUCT': {
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload.id),
      };
    }
    case 'SET_STATE': {
      return action.payload;
    }
    default:
      return state;
  }
};

export type ProductContextType = {
  state: ProductState;
  dispatch: React.Dispatch<ProductAction>;
};

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('shopwave_products');
      if (storedProducts) {
        const parsedState = JSON.parse(storedProducts);
        // Ensure initialProducts are always present if localStorage is empty or something goes wrong
        if (parsedState.products && parsedState.products.length > 0) {
            dispatch({ type: 'SET_STATE', payload: parsedState });
        }
      }
    } catch (error) {
      console.error("Failed to load products from localStorage", error);
    } finally {
        setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
        try {
           localStorage.setItem('shopwave_products', JSON.stringify(state));
        } catch (error) {
          console.error("Failed to save products to localStorage", error);
        }
    }
  }, [state, isHydrated]);

  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};
