// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user profile (role) from Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        let role = 'viewer';
        let name = currentUser.email.split('@')[0];

        if (userSnap.exists()) {
          const data = userSnap.data();
          role = data.role || 'viewer';
          name = data.name || name;
        }

        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          name: name,
          role: role
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, name) => {
    // 1. Create auth user
    console.log("Registering:", { email, password, name }); // Add this log to debug

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    
    console.log("About to create user with email:", email);
    const newUser = userCredential.user;
    console.log("User created:", newUser);

    // 2. Create user profile in Firestore
    await setDoc(doc(db, 'users', newUser.uid), { 
      email: email, 
      name: name,
      role: 'viewer', // Default role
      createdAt: new Date().toISOString()
    });

    return newUser;
  };

  const logout = () => signOut(auth);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      loading
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Helper hook to check if user is admin
export const useIsAdmin = () => {
  const { isAdmin, loading } = useAuth();
  return { isAdmin, loading };
};

// Helper hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { isAuthenticated, loading } = useAuth();
  return { isAuthenticated, loading };
};