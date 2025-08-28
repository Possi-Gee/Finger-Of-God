
'use client';

import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { CartItem } from './cart-context';

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export type ShippingAddress = {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
};

export type Order = {
    id: number;
    date: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    shippingFee: number;
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    deliveryMethod: 'delivery' | 'pickup';
    status: OrderStatus;
};


type OrderState = {
  orders: Order[];
};

type OrderAction =
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: number; status: OrderStatus } }
  | { type: 'SET_STATE'; payload: OrderState };

const initialState: OrderState = {
  orders: [],
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
      };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? { ...order, status: action.payload.status } : order
        ),
      };
    case 'SET_STATE':
      return action.payload;
    default:
      return state;
  }
};

export type OrderContextType = {
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
};

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem('shopwave_orders');
      if (storedOrders) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(storedOrders) });
      }
    } catch (error) {
      console.error("Failed to load orders from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shopwave_orders', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save orders to localStorage", error);
    }
  }, [state]);

  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
};
