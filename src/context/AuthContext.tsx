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
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isDoctor: boolean;
  userRole: UserRole;
  doctorId?: string;
  adminEmail: string;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile | null>;
  registerWithEmail: (email: string, pass: string, name: string, phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<UserProfile | null>;
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

  const fetchProfile = async (user: FirebaseUser): Promise<UserProfile> => {
    const isDoctorUser =
      user.uid === '33alhlNdEfbVTRlx2kTDPzJElmj1' ||
      user.email?.toLowerCase() === 'dr.rahul.sharma@myhospital.com';
    const isEmailAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        // If this is the specific Doctor account, ensure role and doctorId are set
        if (isDoctorUser && (profile.role !== 'doctor' || !profile.doctorId)) {
          const updatedProfile: UserProfile = {
            ...profile,
            role: 'doctor',
            doctorId: profile.doctorId || 'DOC001',
            displayName: profile.displayName || 'Dr. Rahul Sharma',
            specialization: profile.specialization || 'General Medicine',
            status: 'active',
          };
          await saveUserProfile(updatedProfile);
          setUserProfile(updatedProfile);
          return updatedProfile;
        }
        setUserProfile(profile);
        return profile;
      } else {
        // Create initial profile in Firestore
        let role: 'patient' | 'doctor' | 'admin' = 'patient';
        let doctorId: string | undefined = undefined;
        let displayName = user.displayName || user.email?.split('@')[0] || 'Patient';
        let specialization: string | undefined = undefined;

        if (isDoctorUser) {
          role = 'doctor';
          doctorId = 'DOC001';
          displayName = 'Dr. Rahul Sharma';
          specialization = 'General Medicine';
        } else if (isEmailAdmin) {
          role = 'admin';
          displayName = 'Administrator';
        }

        const newProfile: UserProfile = {
          uid: user.uid,
          displayName,
          email: user.email || '',
          phone: user.phoneNumber || '',
          role,
          doctorId,
          specialization,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (e) {
      console.warn('Could not fetch user profile from Firestore:', e);
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        displayName: isDoctorUser
          ? 'Dr. Rahul Sharma'
          : user.displayName || user.email?.split('@')[0] || (isEmailAdmin ? 'Administrator' : 'Patient'),
        email: user.email || '',
        role: isDoctorUser ? 'doctor' : (isEmailAdmin ? 'admin' : 'patient'),
        doctorId: isDoctorUser ? 'DOC001' : undefined,
        specialization: isDoctorUser ? 'General Medicine' : undefined,
        createdAt: new Date().toISOString(),
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (currentUser) {
      return await fetchProfile(currentUser);
    }
    return null;
  };

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

  const loginWithEmail = async (email: string, pass: string): Promise<UserProfile | null> => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    setIsAuthModalOpen(false);
    triggerPostAuth();
    if (cred.user) {
      return await fetchProfile(cred.user);
    }
    return null;
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
      role: 'patient',
      status: 'active',
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
      await fetchProfile(res.user);
    }
    setIsAuthModalOpen(false);
    triggerPostAuth();
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const isEmailAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isAdmin = isEmailAdmin || userProfile?.role === 'admin';
  const isDoctor = userProfile?.role === 'doctor';
  const userRole: UserRole = isAdmin ? 'admin' : isDoctor ? 'doctor' : 'patient';
  const doctorId = userProfile?.doctorId;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isDoctor,
        userRole,
        doctorId,
        adminEmail: ADMIN_EMAIL,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        refreshUserProfile,
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
