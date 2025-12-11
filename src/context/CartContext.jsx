import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

const CART_ITEMS_KEY = 'olive:cart-items';
const CART_BILLING_KEY = 'olive:billing-history';
const LAST_INVOICE_KEY = 'olive:last-invoice';

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Failed to read ${key} from storage`, error);
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn(`Failed to persist ${key} to storage`, error);
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => readStorage(CART_ITEMS_KEY, []));
  const [billingHistory, setBillingHistory] = useState(() => readStorage(CART_BILLING_KEY, []));
  const [lastInvoice, setLastInvoice] = useState(() => readStorage(LAST_INVOICE_KEY, null));

  const addItem = useCallback((item) => {
    setItems((current) => {
      if (current.find((cartItem) => cartItem.id === item.id)) {
        return current;
      }
      return [...current, item];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const recordInvoice = useCallback((invoice) => {
    const nextInvoice = {
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...invoice,
    };

    setBillingHistory((history) => [nextInvoice, ...history]);
    setLastInvoice(nextInvoice);
    setItems([]);
  }, []);

  const removeInvoice = useCallback((id) => {
    setBillingHistory((history) => history.filter((invoice) => invoice.id !== id));
    setLastInvoice((current) => (current?.id === id ? null : current));
  }, []);

  const clearLastInvoice = useCallback(() => setLastInvoice(null), []);

  useEffect(() => {
    writeStorage(CART_ITEMS_KEY, items);
  }, [items]);

  useEffect(() => {
    writeStorage(CART_BILLING_KEY, billingHistory);
  }, [billingHistory]);

  useEffect(() => {
    if (lastInvoice) {
      writeStorage(LAST_INVOICE_KEY, lastInvoice);
    } else if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LAST_INVOICE_KEY);
    }
  }, [lastInvoice]);

  const total = useMemo(() => items.reduce((sum, item) => sum + (item.price || 0), 0), [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      billingHistory,
      recordInvoice,
      removeInvoice,
      lastInvoice,
      clearLastInvoice,
      total,
    }),
    [items, addItem, removeItem, clearCart, billingHistory, recordInvoice, removeInvoice, lastInvoice, clearLastInvoice, total]
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
