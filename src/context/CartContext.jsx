import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);

  const addItem = (item) => {
    setItems((current) => {
      if (current.find((cartItem) => cartItem.id === item.id)) {
        return current;
      }
      return [...current, item];
    });
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const recordInvoice = (invoice) => {
    setBillingHistory((history) => [
      {
        id: `inv_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...invoice,
      },
      ...history,
    ]);
    clearCart();
  };

  const removeInvoice = (id) => {
    setBillingHistory((history) => history.filter((invoice) => invoice.id !== id));
  };

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      billingHistory,
      recordInvoice,
      removeInvoice,
      total: items.reduce((sum, item) => sum + (item.price || 0), 0),
    }),
    [items, billingHistory]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
