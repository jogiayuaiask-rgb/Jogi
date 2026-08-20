import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { app, getFirebaseAuth, loginWithGoogle as firebaseLoginWithGoogle } from '../lib/firebase';

export interface UserProfile {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied:", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage remove denied:", e);
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = safeStorage.getItem('jogi_authenticated_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupAuthListener = async () => {
      try {
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const auth = getAuth(app);

        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Vaidya User',
            };
            setUser(profile);
            safeStorage.setItem('jogi_authenticated_user', JSON.stringify(profile));
          } else {
            // Check if there's a custom saved user session (e.g. guest or local login)
            const saved = safeStorage.getItem('jogi_authenticated_user');
            if (saved) {
              try {
                setUser(JSON.parse(saved));
              } catch {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.warn('Firebase Auth Listener fallback:', err);
        const saved = safeStorage.getItem('jogi_authenticated_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(null);
          }
        }
        setIsLoading(false);
      }
    };

    setupAuthListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await firebaseLoginWithGoogle();
      const profile: UserProfile = {
        uid: (res as any).uid || 'google-user-' + Date.now(),
        email: res.email || 'vaidya@jogiayurved.com',
        displayName: res.displayName || 'Jogi Vaidya User',
      };
      setUser(profile);
      safeStorage.setItem('jogi_authenticated_user', JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (email: string, _pass: string) => {
    setIsLoading(true);
    try {
      const profile: UserProfile = {
        uid: 'email-user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0] || 'Vaidya Practitioner',
      };
      setUser(profile);
      safeStorage.setItem('jogi_authenticated_user', JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const profile: UserProfile = {
      uid: 'guest-' + Date.now(),
      email: 'guest@jogiayurved.com',
      displayName: 'Guest Patient',
    };
    setUser(profile);
    safeStorage.setItem('jogi_authenticated_user', JSON.stringify(profile));
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const auth = getAuth(app);
      await signOut(auth);
    } catch {
      // ignore
    } finally {
      setUser(null);
      safeStorage.removeItem('jogi_authenticated_user');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle: handleGoogleLogin,
        loginWithEmail: handleEmailLogin,
        loginAsGuest: handleGuestLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
