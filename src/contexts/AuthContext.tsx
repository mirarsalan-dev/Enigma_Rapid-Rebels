import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export interface SimpleUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  currentUser: User | SimpleUser | null;
  user: User | SimpleUser | null;
  loading: boolean;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  user: null,
  loading: true,
  loginAsDemo: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | SimpleUser | null>(() => {
    const saved = localStorage.getItem('symbio_demo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setCurrentUser(firebaseUser);
          localStorage.removeItem('symbio_demo_user');
        } else if (!localStorage.getItem('symbio_demo_user')) {
          // Default to a demo user so all features of the app are immediately accessible
          const demoUser: SimpleUser = {
            uid: 'demo_user_123',
            email: 'admin@symbio.eco',
            displayName: 'SYMBIO Industrial Manager',
          };
          setCurrentUser(demoUser);
          localStorage.setItem('symbio_demo_user', JSON.stringify(demoUser));
        }
        setLoading(false);
      });
      return unsubscribe;
    } catch {
      const demoUser: SimpleUser = {
        uid: 'demo_user_123',
        email: 'admin@symbio.eco',
        displayName: 'SYMBIO Industrial Manager',
      };
      setCurrentUser(demoUser);
      setLoading(false);
    }
  }, []);

  const loginAsDemo = () => {
    const demoUser: SimpleUser = {
      uid: 'demo_user_123',
      email: 'admin@symbio.eco',
      displayName: 'SYMBIO Industrial Manager',
    };
    setCurrentUser(demoUser);
    localStorage.setItem('symbio_demo_user', JSON.stringify(demoUser));
  };

  const logout = async () => {
    localStorage.removeItem('symbio_demo_user');
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, user: currentUser, loading, loginAsDemo, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
