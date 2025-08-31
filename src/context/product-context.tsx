
'use client';

import type { Product } from '@/lib/products';
import { products as initialProducts } from '@/lib/products';
import React, { createContext, useReducer, useEffect, type ReactNode, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

type ProductState = {
  products: Product[];
  loading: boolean;
};

type ProductAction =
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: { id: string } }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: ProductState = {
  products: [],
  loading: true,
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
    case 'SET_PRODUCTS': {
      return { ...state, products: action.payload, loading: false };
    }
    case 'SET_LOADING': {
        return { ...state, loading: action.payload };
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

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const productsCol = collection(db, 'products');
    
    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(productsCol, (querySnapshot) => {
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
            products.push(doc.data() as Product);
        });
        dispatch({ type: 'SET_PRODUCTS', payload: products });
    }, (error) => {
        console.error("Error fetching products from Firestore: ", error);
        dispatch({ type: 'SET_LOADING', payload: false });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};
