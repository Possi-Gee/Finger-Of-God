
'use client';

import type { Product, ProductVariant } from '@/lib/products';
import React, { createContext, useReducer, useEffect, type ReactNode, useState } from 'react';

export interface CartItem {
  id: number; // This is now productId_variantId
  productId: number;
  name: string;
  image: string;
  quantity: number;
  variant: ProductVariant;
}

type CartState = {
  items: CartItem[];
};

type AddItemPayload = {
    product: Omit<Product, 'variants' | 'images'> & {images: string[]},
    variant: ProductVariant,
    quantity?: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'SET_STATE'; payload: CartState }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, quantity = 1 } = action.payload;
      const cartItemId = product.id * 1000 + variant.id; // Create a unique ID for the cart item
      const existingItem = state.items.find(item => item.id === cartItemId);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === cartItemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { 
            id: cartItemId,
            productId: product.id,
            name: product.name,
            image: product.images[0],
            quantity,
            variant
        }],
      };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        }
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART': {
      return { ...state, items: [] };
    }
    case 'SET_STATE': {
      return action.payload;
    }
    default:
      return state;
  }
};

export type CartContextType = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('shopwave_cart');
      if (storedCart) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(storedCart) });
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
        try {
            localStorage.setItem('shopwave_cart', JSON.stringify(state));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }
  }, [state, isHydrated]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
