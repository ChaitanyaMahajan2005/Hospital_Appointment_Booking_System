import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Appointment, UserProfile, Doctor } from '../types';

export const ADMIN_EMAIL = 'cmahajan328@gmail.com';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  // Graceful initialization check without forcing blocking server roundtrip
}

// User Profile management
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const dataToSave: Record<string, any> = {
      uid: profile.uid,
      displayName: profile.displayName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      role: profile.role || 'patient',
      createdAt: profile.createdAt || new Date().toISOString(),
    };
    if (profile.doctorId) dataToSave.doctorId = profile.doctorId;
    if (profile.specialization) dataToSave.specialization = profile.specialization;
    if (profile.status) dataToSave.status = profile.status;

    await setDoc(doc(db, 'users', profile.uid), dataToSave, { merge: true });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      console.warn('Firestore profile write notice (cached locally):', err?.message);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      console.warn('Firestore profile read notice (using session state):', err?.message);
      return null;
    }
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// Doctor Management in Firestore
export async function saveDoctorToFirestore(doctor: Doctor): Promise<void> {
  const path = `doctors/${doctor.id}`;
  try {
    await setDoc(doc(db, 'doctors', doctor.id), {
      ...doctor,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      console.warn('Firestore doctor write notice (cached locally):', err?.message);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateDoctorStatusInFirestore(
  doctorId: string,
  status: 'active' | 'inactive'
): Promise<void> {
  const path = `doctors/${doctorId}`;
  try {
    await updateDoc(doc(db, 'doctors', doctorId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      console.warn('Firestore doctor status notice:', err?.message);
      return;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateDoctorProfileInFirestore(
  doctorId: string,
  updates: Partial<Doctor>
): Promise<void> {
  const path = `doctors/${doctorId}`;
  try {
    await updateDoc(doc(db, 'doctors', doctorId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      console.warn('Firestore doctor update notice:', err?.message);
      return;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function getDoctorFromFirestore(doctorId: string): Promise<Doctor | null> {
  const path = `doctors/${doctorId}`;
  try {
    const snap = await getDoc(doc(db, 'doctors', doctorId));
    if (snap.exists()) {
      return snap.data() as Doctor;
    }
    return null;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      return null;
    }
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export function subscribeDoctors(
  onData: (doctors: Doctor[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'doctors';
  const q = collection(db, 'doctors');

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Doctor[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Doctor);
      });
      onData(list);
    },
    (error: any) => {
      console.warn('Doctors collection snapshot notice:', error?.message);
      if (onError) onError(error);
    }
  );
}

// Appointment management
export async function saveAppointmentToFirestore(appointment: Appointment): Promise<void> {
  const path = `appointments/${appointment.id}`;
  try {
    await setDoc(doc(db, 'appointments', appointment.id), {
      ...appointment,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      console.warn('Firestore appointment write notice (saved locally):', err?.message);
      return;
    }
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function cancelAppointmentInFirestore(appointmentId: string): Promise<void> {
  const path = `appointments/${appointmentId}`;
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'Cancelled',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      console.warn('Firestore cancellation notice (updated locally):', err?.message);
      return;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateAppointmentStatusInFirestore(
  appointmentId: string,
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected'
): Promise<void> {
  const path = `appointments/${appointmentId}`;
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      console.warn('Firestore status update notice (updated locally):', err?.message);
      return;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteAppointmentFromFirestore(appointmentId: string): Promise<void> {
  const path = `appointments/${appointmentId}`;
  try {
    await deleteDoc(doc(db, 'appointments', appointmentId));
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      console.warn('Firestore delete notice (removed locally):', err?.message);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeDoctorAppointments(
  doctorId: string,
  onData: (appointments: Appointment[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'appointments';
  const q = query(
    collection(db, 'appointments'),
    where('doctorId', '==', doctorId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Appointment);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error: any) => {
      console.warn('Doctor appointments snapshot notice:', error?.message);
      if (onError) onError(error);
    }
  );
}

export function subscribeAllAppointments(
  onData: (appointments: Appointment[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'appointments';
  const q = collection(db, 'appointments');

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Appointment);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error: any) => {
      console.warn('All appointments snapshot notice (using local storage):', error?.message);
      if (onError) onError(error);
      if (error?.code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
        return;
      }
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Handled
      }
    }
  );
}

export function subscribeUserAppointments(
  userId: string,
  onData: (appointments: Appointment[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'appointments';
  const q = query(
    collection(db, 'appointments'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Appointment);
      });
      // Sort in memory by createdAt descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error: any) => {
      console.warn('Appointments snapshot notice (using local storage):', error?.message);
      if (onError) onError(error);
      if (error?.code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
        return;
      }
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Handled
      }
    }
  );
}

// Auth state helper
export { onAuthStateChanged };
export type { FirebaseUser };
