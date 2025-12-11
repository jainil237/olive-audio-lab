import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const defaultRedirect = '/overview';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = ({ email, name, role }) => {
    if (!role) {
      throw new Error('Role is required to authenticate.');
    }

    setUser({
      email,
      name: name || email?.split('@')[0] || 'Guest',
      role,
    });

    return defaultRedirect;
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
