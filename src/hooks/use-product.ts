
'use client';
import { useContext } from 'react';
import { ProductContext, type ProductContextType } from '@/context/product-context';

export const useProduct = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
