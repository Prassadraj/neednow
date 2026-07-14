// src/context/AuthContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, isFirebaseConfigured } from '@/configs/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('User'); // 'User' or 'Shop Owner'
  const [shopStatus, setShopStatus] = useState(false); // open/closed for shop owners

  // Safe localStorage utility
  const getLocalStorage = (key, fallback) => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem(key);
      try {
        return val ? JSON.parse(val) : fallback;
      } catch {
        return val || fallback;
      }
    }
    return fallback;
  };

  const setLocalStorage = (key, val) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  // Setup/Sync user data
  useEffect(() => {
    // Quickly load from localStorage on client-side mount to prevent "Login" screen flash
    const cachedUser = getLocalStorage('neednow_user', null);
    if (cachedUser) {
      setUser(cachedUser);
      setRole(cachedUser.role || 'User');
      setShopStatus(cachedUser.shopOpen || false);
    }

    if (isFirebaseConfigured && auth) {
      let unsubscribeDoc = null;

      const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
        // Clean up previous doc listener if it exists
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }

        if (fbUser) {
          // Sync with Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          
          unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              const googlePhoto = fbUser.photoURL;
              const storedPhoto = userData.photo;
              const defaultPlaceholder = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
              
              const photoToUse = (storedPhoto && storedPhoto !== defaultPlaceholder)
                ? storedPhoto
                : (googlePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'User')}&background=random`);

              // Sync Google profile updates back to Firestore if they mismatch
              if (
                (fbUser.displayName && userData.name !== fbUser.displayName) ||
                (fbUser.photoURL && (userData.photo === defaultPlaceholder || !userData.photo))
              ) {
                setDoc(userDocRef, {
                  name: fbUser.displayName || userData.name || '',
                  photo: fbUser.photoURL || photoToUse
                }, { merge: true }).catch(err => console.error("Error updating profile in DB:", err));
              }

              const updatedUser = {
                uid: fbUser.uid,
                name: fbUser.displayName || userData.name || 'User',
                email: fbUser.email,
                ...userData,
                photo: photoToUse
              };
              setUser(updatedUser);
              setLocalStorage('neednow_user', updatedUser);
              setRole(userData.role || 'User');
              setShopStatus(userData.shopOpen || false);
            } else {
              // Create user record
              const initialData = {
                uid: fbUser.uid,
                name: fbUser.displayName || 'User',
                email: fbUser.email,
                photo: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'User')}&background=random`,
                points: 10, // starting points
                trustScore: 100,
                tokens: 5, // starting energy tokens
                helpStreak: 0, // count of people helped
                role: 'User',
                shopOpen: false,
                createdAt: new Date().toISOString()
              };
              setDoc(userDocRef, initialData).catch(err => {
                console.error("Error creating user record in Firestore:", err);
              });
              setUser(initialData);
              setLocalStorage('neednow_user', initialData);
              setRole('User');
            }
            setLoading(false);
          }, (error) => {
            console.error("Firestore onSnapshot error (falling back to Google Auth details):", error);
            // Fall back to local state using Google Auth details so user is still logged in
            const fallbackUser = {
              uid: fbUser.uid,
              name: fbUser.displayName || 'User',
              email: fbUser.email,
              photo: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'User')}&background=random`,
              points: 10,
              trustScore: 100,
              tokens: 5,
              helpStreak: 0,
              role: 'User',
              shopOpen: false
            };
            setUser(fallbackUser);
            setLocalStorage('neednow_user', fallbackUser);
            setLoading(false);
          });
        } else {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('neednow_user');
          }
          setLoading(false);
        }
      });

      return () => {
        unsubscribeAuth();
        if (unsubscribeDoc) unsubscribeDoc();
      };
    } else {
      // Mock mode logic: Load mock user from localStorage if exists
      const savedUser = getLocalStorage('neednow_user', null);
      if (savedUser) {
        setUser(savedUser);
        setRole(savedUser.role || 'User');
        setShopStatus(savedUser.shopOpen || false);
      }
      setLoading(false);
    }
  }, []);

  // Google sign in simulation/live
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    } else {
      // Simulate Google Sign-in with mock user
      const mockUser = {
        uid: 'mock-user-123',
        name: 'Alex LocalHero',
        email: 'alex.local@example.com',
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        points: 50,
        trustScore: 100,
        tokens: 5,
        helpStreak: 0,
        role: 'User',
        shopOpen: false,
        createdAt: new Date().toISOString()
      };
      setUser(mockUser);
      setLocalStorage('neednow_user', mockUser);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch (error) {
        console.error("Firebase Signout Error:", error);
      }
    } else {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('neednow_user');
      }
    }
  };

  const toggleRole = async () => {
    const newRole = role === 'User' ? 'Shop Owner' : 'User';
    setRole(newRole);

    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);

      if (isFirebaseConfigured && auth) {
        await setDoc(doc(db, 'users', user.uid), { role: newRole }, { merge: true });
      } else {
        setLocalStorage('neednow_user', updatedUser);
      }
    }
  };

  const setShopOpenClose = async (isOpen) => {
    setShopStatus(isOpen);
    if (user) {
      const updatedUser = { ...user, shopOpen: isOpen };
      setUser(updatedUser);

      if (isFirebaseConfigured && auth) {
        await setDoc(doc(db, 'users', user.uid), { shopOpen: isOpen }, { merge: true });
      } else {
        setLocalStorage('neednow_user', updatedUser);
      }
    }
  };

  const updatePoints = async (pointsToAdd) => {
    if (!user) return;
    const newPoints = (user.points || 0) + pointsToAdd;
    const updatedUser = { ...user, points: newPoints };
    setUser(updatedUser);
    setLocalStorage('neednow_user', updatedUser);

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'users', user.uid), { points: newPoints }, { merge: true });
    }
  };

  const MAX_TOKENS = 5;
  const EMERGENCY_CATEGORIES = ['Medicine', 'Water', 'Emergency'];

  const canRaiseRequest = (category = '') => {
    if (EMERGENCY_CATEGORIES.includes(category)) return true; // bypass for emergencies
    return (user?.tokens ?? MAX_TOKENS) > 0;
  };

  const updateTokens = async (delta) => {
    if (!user) return;
    const current = user.tokens ?? MAX_TOKENS;
    const newTokens = Math.min(MAX_TOKENS, Math.max(0, current + delta));
    const updatedUser = { ...user, tokens: newTokens };
    setUser(updatedUser);
    setLocalStorage('neednow_user', updatedUser);

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'users', user.uid), { tokens: newTokens }, { merge: true });
    }
  };

  const incrementHelpStreak = async () => {
    if (!user) return;
    const newStreak = (user.helpStreak || 0) + 1;
    let bonusTokens = 0;
    // Every 5 helps = +1 bonus token
    if (newStreak % 5 === 0) bonusTokens = 1;
    const current = user.tokens ?? MAX_TOKENS;
    const newTokens = Math.min(MAX_TOKENS, current + bonusTokens);
    const updatedUser = { ...user, helpStreak: newStreak, tokens: newTokens };
    setUser(updatedUser);
    setLocalStorage('neednow_user', updatedUser);

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'users', user.uid), { helpStreak: newStreak, tokens: newTokens }, { merge: true });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      role, 
      shopStatus, 
      loginWithGoogle, 
      logout, 
      toggleRole, 
      setShopOpenClose,
      updatePoints,
      updateTokens,
      canRaiseRequest,
      incrementHelpStreak,
      MAX_TOKENS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
