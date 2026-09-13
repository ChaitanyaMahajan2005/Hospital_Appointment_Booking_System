/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Page, Department, Doctor, Appointment } from './types';
import { DEPARTMENTS, DOCTORS, INITIAL_APPOINTMENTS } from './data/hospitalData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { AdminPage } from './pages/AdminPage';
import { AppointmentBookingModal } from './components/AppointmentBookingModal';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { DepartmentDetailModal } from './components/DepartmentDetailModal';
import { MyAppointmentsModal } from './components/MyAppointmentsModal';
import { EmergencyModal } from './components/EmergencyModal';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  saveAppointmentToFirestore,
  cancelAppointmentInFirestore,
  subscribeUserAppointments,
  subscribeAllAppointments,
} from './lib/firebase';
import { CheckCircle2, PhoneCall, Calendar, ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'my_hospital_appointments_v1';
const LEGACY_STORAGE_KEY = 'medisquare_hospital_appointments_v1';

function HospitalApp() {
  const { currentUser, isAdmin, openAuthModal } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [departments] = useState<Department[]>(DEPARTMENTS);
  const [doctors] = useState<Doctor[]>(DOCTORS);

  // Appointments persistence
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load appointments from localStorage', e);
    }
    return INITIAL_APPOINTMENTS;
  });

  // Subscribe to real-time appointments from Firestore:
  // If user is Admin -> subscribe to ALL hospital appointments
  // If user is regular patient -> subscribe to their own appointments
  // If not logged in -> use localStorage / INITIAL_APPOINTMENTS
  useEffect(() => {
    if (!currentUser) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
        if (saved) {
          setAppointments(JSON.parse(saved));
        } else {
          setAppointments(INITIAL_APPOINTMENTS);
        }
      } catch (e) {
        console.warn('Error reading local appointments:', e);
      }
      return;
    }

    const onData = (cloudAppointments: Appointment[]) => {
      if (cloudAppointments && cloudAppointments.length > 0) {
        setAppointments(cloudAppointments);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudAppointments));
        } catch (e) {
          // ignore
        }
      }
    };

    const onError = (error: any) => {
      console.warn('Firestore subscription notice (using local cache):', error?.message);
    };

    const unsubscribe = isAdmin
      ? subscribeAllAppointments(onData, onError)
      : subscribeUserAppointments(currentUser.uid, onData, onError);

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid, isAdmin]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.warn('Failed to save appointments to localStorage', e);
    }
  }, [appointments]);

  // Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | undefined>(undefined);
  const [preselectedDepartmentId, setPreselectedDepartmentId] = useState<string | undefined>(undefined);

  const [activeDoctorDetail, setActiveDoctorDetail] = useState<Doctor | null>(null);
  const [activeDepartmentDetail, setActiveDepartmentDetail] = useState<Department | null>(null);
  const [myAppointmentsOpen, setMyAppointmentsOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  const handleAppointmentUpdated = useCallback((updatedList: Appointment[]) => {
    setAppointments(updatedList);
  }, []);

  // Open booking modal with optional doctor/dept pre-fill, gating on auth
  const handleOpenBooking = (doctorId?: string, deptId?: string) => {
    if (!currentUser) {
      showToast('Please sign in or register to book your doctor appointment.');
      openAuthModal('signin', () => {
        setPreselectedDoctorId(doctorId);
        setPreselectedDepartmentId(deptId);
        setBookingModalOpen(true);
      });
      return;
    }

    setPreselectedDoctorId(doctorId);
    setPreselectedDepartmentId(deptId);
    setBookingModalOpen(true);
  };

  const handleAppointmentBooked = async (newAppointment: Appointment) => {
    // 1. Optimistic update
    setAppointments((prev) => [newAppointment, ...prev.filter((a) => a.id !== newAppointment.id)]);
    showToast(`Appointment ${newAppointment.id} confirmed for ${newAppointment.patientName}!`);

    // 2. Persist in Firestore if user is authenticated
    if (currentUser) {
      try {
        await saveAppointmentToFirestore({
          ...newAppointment,
          userId: currentUser.uid,
        });
      } catch (err) {
        console.error('Failed to sync appointment to Firestore:', err);
      }
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: 'Cancelled' as const } : apt))
    );
    showToast(`Appointment ${appointmentId} has been cancelled.`);

    if (currentUser) {
      try {
        await cancelAppointmentInFirestore(appointmentId);
      } catch (err) {
        console.error('Failed to cancel appointment in Firestore:', err);
      }
    }
  };

  const handleSelectDepartment = (dept: Department) => {
    setActiveDepartmentDetail(dept);
  };

  const handleViewDoctorProfile = (doctor: Doctor) => {
    setActiveDoctorDetail(doctor);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onOpenBooking={handleOpenBooking}
        onOpenAppointments={() => setMyAppointmentsOpen(true)}
        onOpenEmergency={() => setEmergencyModalOpen(true)}
        appointmentsCount={appointments.filter((a) => a.status === 'Confirmed').length}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            departments={departments}
            doctors={doctors}
            onNavigate={(page) => setCurrentPage(page)}
            onOpenBooking={handleOpenBooking}
            onSelectDepartment={handleSelectDepartment}
            onViewDoctorProfile={handleViewDoctorProfile}
            onOpenEmergency={() => setEmergencyModalOpen(true)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onNavigate={(page) => setCurrentPage(page)}
            onOpenBooking={handleOpenBooking}
            onOpenEmergency={() => setEmergencyModalOpen(true)}
          />
        )}

        {currentPage === 'departments' && (
          <DepartmentsPage
            departments={departments}
            doctors={doctors}
            onSelectDepartment={handleSelectDepartment}
            onBookDepartment={(dept) => handleOpenBooking(undefined, dept.id)}
            onNavigateToDoctors={() => setCurrentPage('doctors')}
          />
        )}

        {currentPage === 'doctors' && (
          <DoctorsPage
            doctors={doctors}
            departments={departments}
            onBookDoctor={(doc) => handleOpenBooking(doc.id, doc.departmentId)}
            onViewDoctorProfile={handleViewDoctorProfile}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage
            appointments={appointments}
            departments={departments}
            doctors={doctors}
            onNavigateHome={() => setCurrentPage('home')}
            onAppointmentUpdated={handleAppointmentUpdated}
            onOpenBooking={() => setBookingModalOpen(true)}
            showToast={showToast}
          />
        )}
      </main>

      {/* Hospital Footer */}
      <Footer
        onNavigate={(page) => setCurrentPage(page)}
        onOpenBooking={handleOpenBooking}
        onOpenEmergency={() => setEmergencyModalOpen(true)}
      />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Booking & Details Modals */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        departments={departments}
        doctors={doctors}
        preselectedDoctorId={preselectedDoctorId}
        preselectedDepartmentId={preselectedDepartmentId}
        onAppointmentBooked={handleAppointmentBooked}
      />

      <DoctorDetailModal
        doctor={activeDoctorDetail}
        onClose={() => setActiveDoctorDetail(null)}
        onBook={(doc) => handleOpenBooking(doc.id, doc.departmentId)}
      />

      <DepartmentDetailModal
        department={activeDepartmentDetail}
        doctors={
          activeDepartmentDetail
            ? doctors.filter((d) => d.departmentId === activeDepartmentDetail.id)
            : []
        }
        onClose={() => setActiveDepartmentDetail(null)}
        onBookDoctor={(doc) => {
          setActiveDepartmentDetail(null);
          handleOpenBooking(doc.id, doc.departmentId);
        }}
        onViewDoctorProfile={(doc) => {
          setActiveDepartmentDetail(null);
          setActiveDoctorDetail(doc);
        }}
      />

      <MyAppointmentsModal
        isOpen={myAppointmentsOpen}
        onClose={() => setMyAppointmentsOpen(false)}
        appointments={appointments}
        onCancelAppointment={handleCancelAppointment}
        onOpenBooking={() => {
          setMyAppointmentsOpen(false);
          handleOpenBooking();
        }}
      />

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />

      {/* Floating Bottom Quick Action for Mobile / Quick Booking */}
      <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2.5">
        <button
          id="floating-emergency-fab"
          onClick={() => setEmergencyModalOpen(true)}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
          title="24/7 Emergency Assistance"
        >
          <PhoneCall className="w-5 h-5 animate-pulse" />
        </button>

        <button
          id="floating-appointment-fab"
          onClick={() => handleOpenBooking()}
          className="px-4 py-3 rounded-full bg-teal-600 hover:bg-teal-500 text-white shadow-xl shadow-teal-600/30 flex items-center gap-2 font-bold text-xs transition-transform hover:scale-105 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Book Appointment</span>
        </button>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HospitalApp />
    </AuthProvider>
  );
}

