import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, getUserProfile, saveUserProfile, testConnection, ADMIN_EMAIL } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  adminEmail: string;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  openAuthModal: (mode?: 'signin' | 'signup', onAuthSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  pendingPostAuthAction: (() => void) | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [pendingPostAuthAction, setPendingPostAuthAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Create initial profile if missing
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'Patient',
              email: user.email || '',
              phone: user.phoneNumber || '',
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          console.warn('Could not fetch user profile from Firestore:', e);
          setUserProfile({
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Patient',
            email: user.email || '',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin', onAuthSuccessCallback?: () => void) => {
    setAuthModalMode(mode);
    if (onAuthSuccessCallback) {
      setPendingPostAuthAction(() => onAuthSuccessCallback);
    } else {
      setPendingPostAuthAction(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingPostAuthAction(null);
  };

  const triggerPostAuth = () => {
    if (pendingPostAuthAction) {
      const action = pendingPostAuthAction;
      setPendingPostAuthAction(null);
      setTimeout(() => {
        action();
      }, 200);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    setIsAuthModalOpen(false);
    triggerPostAuth();
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone: string) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      await updateProfile(userCred.user, { displayName: name });
    }
    const profile: UserProfile = {
      uid: userCred.user.uid,
      displayName: name || email.split('@')[0],
      email: email,
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };
    try {
      await saveUserProfile(profile);
    } catch (err) {
      console.warn('Failed to save profile to Firestore:', err);
    }
    setUserProfile(profile);
    setIsAuthModalOpen(false);
    triggerPostAuth();
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      const existing = await getUserProfile(res.user.uid).catch(() => null);
      if (!existing) {
        const newProfile: UserProfile = {
          uid: res.user.uid,
          displayName: res.user.displayName || res.user.email?.split('@')[0] || 'Patient',
          email: res.user.email || '',
          phone: res.user.phoneNumber || '',
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(newProfile).catch(() => {});
        setUserProfile(newProfile);
      } else {
        setUserProfile(existing);
      }
    }
    setIsAuthModalOpen(false);
    triggerPostAuth();
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const isAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        adminEmail: ADMIN_EMAIL,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        pendingPostAuthAction,
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
