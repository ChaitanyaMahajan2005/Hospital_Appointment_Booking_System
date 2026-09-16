import React, { useState, useMemo } from 'react';
import { Appointment, Doctor } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  Search,
  Filter,
  Download,
  Printer,
  LogOut,
  ArrowLeft,
  Lock,
  RefreshCw,
  FileText,
  Building2,
  MapPin,
  Award,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  UserCheck,
  Eye,
  EyeOff,
  Save,
  HelpCircle
} from 'lucide-react';
import {
  updateAppointmentStatusInFirestore,
  updateDoctorProfileInFirestore,
  saveDoctorToFirestore
} from '../lib/firebase';
import { downloadAppointmentSlip, printAppointmentSlip } from '../utils/appointmentSlip';

interface DoctorPortalPageProps {
  doctor: Doctor | null;
  appointments: Appointment[];
  onNavigateHome: () => void;
  onAppointmentUpdated: (updatedAppointments: Appointment[]) => void;
  showToast: (msg: string) => void;
}

export const DoctorPortalPage: React.FC<DoctorPortalPageProps> = ({
  doctor,
  appointments,
  onNavigateHome,
  onAppointmentUpdated,
  showToast,
}) => {
  const { currentUser, userProfile, isDoctor, isAdmin, logout, loginWithEmail } = useAuth();

  // Login form state for doctors not logged in yet
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active tab inside Doctor Portal: 'dashboard' | 'appointments' | 'profile'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'profile'>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('appointments')) return 'appointments';
    if (hash.includes('profile')) return 'profile';
    return 'dashboard';
  });

  const handleTabChange = (tab: 'dashboard' | 'appointments' | 'profile') => {
    setActiveTab(tab);
    window.location.hash = `#/doctor/${tab}`;
  };

  // Helper to format Firebase error without exposing raw codes
  const formatDoctorAuthError = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found' ||
      message.includes('auth/invalid-credential') ||
      message.includes('auth/wrong-password') ||
      message.includes('auth/user-not-found')
    ) {
      return 'Invalid email or password.';
    }
    if (code === 'auth/invalid-email' || message.includes('auth/invalid-email')) {
      return 'Please enter a valid doctor email address.';
    }
    if (code === 'auth/user-disabled' || message.includes('auth/user-disabled')) {
      return 'This doctor account has been deactivated. Please contact the hospital administrator.';
    }
    if (code === 'auth/too-many-requests' || message.includes('auth/too-many-requests')) {
      return 'Access temporarily locked due to multiple failed attempts. Please try again later.';
    }
    if (code === 'auth/network-request-failed' || message.includes('network')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    return 'Invalid email or password.';
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState<string>('');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Appointment Details Modal state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Confirmation Modal state for destructive actions (Reject / Cancel)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    appointmentId: string;
    patientName: string;
    actionType: 'Rejected' | 'Cancelled';
  }>({
    isOpen: false,
    appointmentId: '',
    patientName: '',
    actionType: 'Rejected',
  });

  // Doctor Profile Editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profilePhone, setProfilePhone] = useState(doctor?.phone || '');
  const [profileRoom, setProfileRoom] = useState(doctor?.roomLocation || '');
  const [profileAvailability, setProfileAvailability] = useState(doctor?.availabilityText || '');
  const [profileBio, setProfileBio] = useState(doctor?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Handle Doctor Login
  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const profile = await loginWithEmail(emailInput.trim(), passwordInput);
      if (profile?.role !== 'doctor') {
        setLoginError('You are not authorized to access the Doctor Portal.');
        await logout();
      } else {
        showToast('Welcome to the M. Y. Hospital Doctor Portal.');
      }
    } catch (err: any) {
      console.error('Doctor login error:', err);
      setLoginError(formatDoctorAuthError(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Status Change Handler with Firestore sync
  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected'
  ) => {
    setActionLoadingId(appointmentId);
    try {
      const updated = appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: newStatus } : a
      );
      onAppointmentUpdated(updated);

      // If active in modal, update that as well
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }

      await updateAppointmentStatusInFirestore(appointmentId, newStatus);
      showToast(`Appointment status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update status in Firestore:', err);
      showToast(`Appointment status updated to ${newStatus} locally.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Trigger confirmation dialog for destructive status transitions
  const requestDestructiveStatusChange = (
    appointment: Appointment,
    action: 'Rejected' | 'Cancelled'
  ) => {
    setConfirmDialog({
      isOpen: true,
      appointmentId: appointment.id,
      patientName: appointment.patientName,
      actionType: action,
    });
  };

  const handleConfirmDestructiveAction = async () => {
    if (!confirmDialog.appointmentId) return;
    const { appointmentId, actionType } = confirmDialog;
    setConfirmDialog({ isOpen: false, appointmentId: '', patientName: '', actionType: 'Rejected' });
    await handleStatusUpdate(appointmentId, actionType);
  };

  // Filter appointments for this doctor strictly
  const doctorAppointments = useMemo(() => {
    const docId = doctor?.id || userProfile?.doctorId || (currentUser?.uid === '33alhlNdEfbVTRlx2kTDPzJElmj1' ? 'DOC001' : '');
    const docUid = doctor?.uid || (currentUser?.uid === '33alhlNdEfbVTRlx2kTDPzJElmj1' ? '33alhlNdEfbVTRlx2kTDPzJElmj1' : currentUser?.uid || '');

    if (!docId && !docUid) {
      return [];
    }

    return appointments.filter((apt) => {
      // Strictly match doctorId or docUid assigned to this doctor
      const matchDocId = Boolean(docId && apt.doctorId === docId);
      const matchDocUid = Boolean(docUid && (apt.doctorId === docUid || (apt as any).doctorUid === docUid));
      return matchDocId || matchDocUid;
    });
  }, [appointments, doctor, userProfile, currentUser]);

  // Metrics Calculation for Doctor
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = doctorAppointments.length;
    const confirmed = doctorAppointments.filter((a) => a.status === 'Confirmed').length;
    const pending = doctorAppointments.filter((a) => a.status === 'Pending').length;
    const completed = doctorAppointments.filter((a) => a.status === 'Completed').length;
    const cancelledOrRejected = doctorAppointments.filter(
      (a) => a.status === 'Cancelled' || a.status === 'Rejected'
    ).length;
    const todayAppointments = doctorAppointments.filter((a) => a.appointmentDate === todayStr);

    return {
      total,
      confirmed,
      pending,
      completed,
      cancelledOrRejected,
      todayCount: todayAppointments.length,
      todayList: todayAppointments,
    };
  }, [doctorAppointments]);

  // Filtered Appointments list
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return doctorAppointments.filter((apt) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          apt.patientName.toLowerCase().includes(q) ||
          apt.id.toLowerCase().includes(q) ||
          apt.tokenNumber?.toLowerCase().includes(q) ||
          apt.patientPhone?.includes(q) ||
          (apt.symptoms && apt.symptoms.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL' && apt.status !== statusFilter) {
        return false;
      }

      // 3. Date Filter
      if (dateFilter === 'TODAY' && apt.appointmentDate !== todayStr) {
        return false;
      }
      if (dateFilter === 'UPCOMING' && apt.appointmentDate < todayStr) {
        return false;
      }
      if (dateFilter === 'CUSTOM' && customDate && apt.appointmentDate !== customDate) {
        return false;
      }

      return true;
    });
  }, [doctorAppointments, searchQuery, statusFilter, dateFilter, customDate]);

  // Save updated profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    setSavingProfile(true);
    try {
      const updatedDoctor: Doctor = {
        ...doctor,
        phone: profilePhone.trim() || doctor.phone,
        roomLocation: profileRoom.trim() || doctor.roomLocation,
        availabilityText: profileAvailability.trim() || doctor.availabilityText,
        bio: profileBio.trim() || doctor.bio,
      };
      await updateDoctorProfileInFirestore(doctor.id, updatedDoctor);
      await saveDoctorToFirestore(updatedDoctor);
      showToast('Doctor workstation profile updated successfully.');
      setEditingProfile(false);
    } catch (err: any) {
      console.error('Error updating doctor profile:', err);
      showToast(err?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  /* =========================================================================
     VIEW 1A: ACCESS DENIED (If authenticated user is not a doctor)
     ========================================================================= */
  if (currentUser && !isDoctor) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-900/5 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold font-['Outfit'] text-slate-900">Access Denied</h2>
          <p className="text-sm font-semibold text-red-600 mt-1">
            You are not authorized to access the Doctor Portal.
          </p>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            Signed in as <strong className="text-slate-800">{currentUser.email}</strong> ({userProfile?.role === 'admin' ? 'Administrator' : 'Patient'}). Access to the Doctor Clinical Workstation is strictly restricted to authorized medical practitioners.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => logout()}
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Sign Out to Switch Account
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-colors"
            >
              Return to Hospital Public Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 1B: DOCTOR LOGIN GATE (If not authenticated)
     ========================================================================= */
  if (!currentUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-900/5 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-6 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] tracking-tight">Doctor Portal Access</h2>
            <p className="text-xs text-teal-200 mt-1">
              Maharaja Yeshwantrao Hospital Clinical Workstation
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-[11px] font-medium">
              <Lock className="w-3 h-3" />
              <span>Restricted to Authorized Medical Doctors</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleDoctorLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Doctor Email Address
                </label>
                <input
                  type="email"
                  id="doctor-login-email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="dr.rahul.sharma@myhospital.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="doctor-login-password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-900 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="doctor-submit-login-btn"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-900/10 disabled:opacity-50 transition-colors"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Doctor Credentials...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>Login to Doctor Workstation</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Hospital Public Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: AUTHENTICATED DOCTOR WORKSTATION & DASHBOARD
     ========================================================================= */
  const docDisplayName = doctor?.name || userProfile?.displayName || 'Dr. Medical Specialist';
  const docSpecialty = doctor?.specialty || doctor?.departmentName || userProfile?.specialization || 'Clinical Specialist';

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Doctor Header Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-lg shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold font-['Outfit'] tracking-tight text-white">
                    {docDisplayName}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                    Doctor Portal
                  </span>
                  {doctor?.status === 'inactive' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                      Schedule Paused
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  <span className="font-semibold text-teal-300">{docSpecialty}</span> • {doctor?.roomLocation || 'OPD Chambers, MY Hospital'}
                </p>
              </div>
            </div>

            {/* Navigation Tabs and Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'dashboard'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock3 className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('appointments')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'appointments'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Appointments ({doctorAppointments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'profile'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Public Site</span>
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="px-3 py-1.5 rounded-xl bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Sign out of Doctor Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* =========================================================================
            TAB 1: DOCTOR DASHBOARD VIEW (KPI Cards, Welcome, Today's OPD Schedule)
            ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Greeting Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                  Doctor Workstation Overview
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit'] mt-0.5">
                  Welcome, {docDisplayName}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  You are registered in the <strong className="text-slate-700">{docSpecialty}</strong> department. 
                  Below is your live clinical appointment feed and OPD consultation queue.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="doctor-view-appointments-btn"
                  onClick={() => handleTabChange('appointments')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View Appointments</span>
                </button>
              </div>
            </div>

            {/* KPI Statistics Cards matching User Specification */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div 
                onClick={() => { setStatusFilter('ALL'); handleTabChange('appointments'); }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-teal-400 hover:shadow-sm transition-all"
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Appointments
                </span>
                <div className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
                  {metrics.total}
                </div>
                <span className="text-[10px] text-slate-400">All assigned appointments</span>
              </div>

              <div 
                onClick={() => { setStatusFilter('Pending'); handleTabChange('appointments'); }}
                className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all"
              >
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
                  <Clock3 className="w-3 h-3 text-amber-600" />
                  Pending
                </span>
                <div className="text-2xl font-extrabold text-amber-700 font-['Outfit'] mt-1">
                  {metrics.pending}
                </div>
                <span className="text-[10px] text-amber-600/80">Awaiting confirmation</span>
              </div>

              <div 
                onClick={() => { setStatusFilter('Confirmed'); handleTabChange('appointments'); }}
                className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  Confirmed
                </span>
                <div className="text-2xl font-extrabold text-blue-700 font-['Outfit'] mt-1">
                  {metrics.confirmed}
                </div>
                <span className="text-[10px] text-blue-600/80">Active booked slots</span>
              </div>

              <div 
                onClick={() => { setStatusFilter('Completed'); handleTabChange('appointments'); }}
                className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Completed
                </span>
                <div className="text-2xl font-extrabold text-emerald-700 font-['Outfit'] mt-1">
                  {metrics.completed}
                </div>
                <span className="text-[10px] text-emerald-600/80">Fulfilled visits</span>
              </div>

              <div 
                onClick={() => { setStatusFilter('Cancelled'); handleTabChange('appointments'); }}
                className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs cursor-pointer hover:border-rose-400 hover:shadow-sm transition-all"
              >
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-600" />
                  Cancelled
                </span>
                <div className="text-2xl font-extrabold text-rose-700 font-['Outfit'] mt-1">
                  {metrics.cancelledOrRejected}
                </div>
                <span className="text-[10px] text-rose-600/80">Cancelled or rejected</span>
              </div>
            </div>

            {/* Today's Schedule Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-sm text-slate-900">Today's Appointment Agenda</h3>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                    {metrics.todayCount} patients
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('TODAY');
                    setActiveTab('appointments');
                  }}
                  className="text-xs text-teal-700 hover:text-teal-900 font-bold cursor-pointer flex items-center gap-1"
                >
                  <span>Open Full Queue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {metrics.todayList.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No appointments scheduled for today yet. You can inspect upcoming dates in the Appointments tab.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {metrics.todayList.map((apt) => (
                    <div key={apt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-[11px]">
                          {apt.tokenNumber || 'TOKEN'}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{apt.patientName}</p>
                          <p className="text-[11px] text-slate-500">
                            {apt.appointmentTime} • {apt.visitType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            apt.status === 'Confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : apt.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(apt)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: DOCTOR APPOINTMENTS LIST VIEW (Filterable, Actionable, Details)
            ========================================================================= */}
        {activeTab === 'appointments' && (
          <>
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="w-full md:w-80 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient name, token, symptoms..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Schedule:</span>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                    >
                      <option value="ALL">All Dates</option>
                      <option value="TODAY">Today's OPD</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="CUSTOM">Custom Date</option>
                    </select>
                  </div>

                  {dateFilter === 'CUSTOM' && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                    />
                  )}

                  {(searchQuery || statusFilter !== 'ALL' || dateFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                        setDateFilter('ALL');
                        setCustomDate('');
                      }}
                      className="text-xs text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer ml-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor Appointments Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Assigned Patient Consultations</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                    {filteredAppointments.length}
                  </span>
                </h2>
                <div className="text-xs text-slate-400">
                  Update consultation status & view patient clinical slips
                </div>
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">No Consultations Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    There are no patient appointments matching your active filters for this doctor schedule.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Token & ID</th>
                        <th className="py-3 px-4">Patient Details</th>
                        <th className="py-3 px-4">Scheduled Slot</th>
                        <th className="py-3 px-4">Visit Reason</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAppointments.map((apt) => {
                        const isCancelled = apt.status === 'Cancelled' || apt.status === 'Rejected';
                        const isCompleted = apt.status === 'Completed';
                        const isConfirmed = apt.status === 'Confirmed';
                        const isPending = apt.status === 'Pending';

                        return (
                          <tr
                            key={apt.id}
                            className={`hover:bg-slate-50/60 transition-colors ${
                              isCancelled ? 'bg-slate-50/30 text-slate-400' : ''
                            }`}
                          >
                            {/* Token */}
                            <td className="py-3.5 px-4 align-top">
                              <div className="inline-block px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-xs">
                                {apt.tokenNumber || 'TOKEN'}
                              </div>
                              <p className="font-mono text-[10px] text-slate-400 mt-1">{apt.id}</p>
                              <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
                                {apt.visitType}
                              </span>
                            </td>

                            {/* Patient Info */}
                            <td className="py-3.5 px-4 align-top">
                              <p className="font-bold text-slate-900 text-sm">{apt.patientName}</p>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                {apt.patientAge} Yrs • {apt.patientGender}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {apt.patientPhone}
                                </span>
                              </div>
                            </td>

                            {/* Schedule */}
                            <td className="py-3.5 px-4 align-top">
                              <div className="font-semibold text-slate-800 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                                <span>{apt.appointmentDate}</span>
                              </div>
                              <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{apt.appointmentTime}</span>
                              </div>
                            </td>

                            {/* Symptoms */}
                            <td className="py-3.5 px-4 align-top max-w-xs">
                              {apt.symptoms ? (
                                <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] line-clamp-2">
                                  {apt.symptoms}
                                </p>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">General consultation</span>
                              )}
                            </td>

                            {/* Status badge */}
                            <td className="py-3.5 px-4 align-top">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : isConfirmed
                                    ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                    : isPending
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}
                              >
                                {apt.status}
                              </span>

                              {/* Status Dropdown */}
                              <div className="mt-1.5">
                                <select
                                  disabled={actionLoadingId === apt.id}
                                  value={apt.status}
                                  onChange={(e) => {
                                    const next = e.target.value as any;
                                    if (next === 'Rejected' || next === 'Cancelled') {
                                      requestDestructiveStatusChange(apt, next);
                                    } else {
                                      handleStatusUpdate(apt.id, next);
                                    }
                                  }}
                                  className="text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Rejected">Rejected</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 align-top text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* Direct One-Click Workflow Actions */}
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleStatusUpdate(apt.id, 'Confirmed')}
                                      className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                      title="Confirm appointment"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Confirm</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => requestDestructiveStatusChange(apt, 'Rejected')}
                                      className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Reject appointment"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                {isConfirmed && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleStatusUpdate(apt.id, 'Completed')}
                                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                      title="Mark consultation completed"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Complete</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => requestDestructiveStatusChange(apt, 'Cancelled')}
                                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Cancel appointment"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      <span>Cancel</span>
                                    </button>
                                  </>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedAppointment(apt)}
                                  className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                                  title="View full appointment details"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => downloadAppointmentSlip(apt)}
                                  className="p-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 cursor-pointer"
                                  title="Download consultation slip"
                                >
                                  <Download className="w-3 h-3 text-teal-700" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => printAppointmentSlip(apt)}
                                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                                  title="Print consultation slip"
                                >
                                  <Printer className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* =========================================================================
            TAB 3: DOCTOR PROFILE VIEW (Credentials, Schedule, Editable Chamber Info)
            ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl font-['Outfit'] shadow-md shadow-teal-600/20 shrink-0">
                    {docDisplayName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{docDisplayName}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{docSpecialty}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentUser?.email} • {doctor?.qualification || 'Consultant Specialist'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="px-3.5 py-1.5 rounded-xl border border-teal-600 text-teal-700 hover:bg-teal-50 text-xs font-bold cursor-pointer transition-colors"
                >
                  {editingProfile ? 'Cancel Editing' : 'Edit Practice Info'}
                </button>
              </div>

              {editingProfile ? (
                /* Edit Mode */
                <form onSubmit={handleSaveProfile} className="py-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        OPD Consultation Chamber / Room
                      </label>
                      <input
                        type="text"
                        value={profileRoom}
                        onChange={(e) => setProfileRoom(e.target.value)}
                        placeholder="Chamber 104, OPD Block"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Consultation Hours & Availability
                      </label>
                      <input
                        type="text"
                        value={profileAvailability}
                        onChange={(e) => setProfileAvailability(e.target.value)}
                        placeholder="Mon - Sat, 9:00 AM - 4:00 PM"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Doctor Bio / Clinical Focus
                      </label>
                      <textarea
                        rows={3}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingProfile ? 'Saving...' : 'Save Updates'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Read-only details view */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      OPD Room Location
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{doctor?.roomLocation || 'Room 102, Main OPD Block'}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      OPD Consultation Schedule
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{doctor?.availabilityText || 'Monday – Saturday (9:00 AM – 4:00 PM)'}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Clinical Experience & Qualifications
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      <span>
                        {doctor?.experienceYears || 5}+ Years ({doctor?.qualification || 'MBBS, MD'})
                      </span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Practice Status
                    </span>
                    <p className="text-xs font-semibold mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className={doctor?.status === 'inactive' ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                        {doctor?.status === 'inactive' ? 'Schedule Paused' : 'Active for Consultations'}
                      </span>
                    </p>
                  </div>

                  {doctor?.bio && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Clinical Overview
                      </span>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {doctor.bio}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Doctor ID: <span className="font-mono text-slate-600">{doctor?.id}</span> • Auth UID: <span className="font-mono text-slate-600">{currentUser?.uid}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('appointments')}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 cursor-pointer shadow-xs"
                >
                  Return to Consultations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          APPOINTMENT DETAILS MODAL
          ========================================================================= */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold font-['Outfit']">Appointment Details</h3>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold">
                      {selectedAppointment.tokenNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">ID: {selectedAppointment.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Patient Info Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Patient Profile
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedAppointment.status === 'Confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedAppointment.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedAppointment.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Full Name</span>
                    <strong className="text-slate-900 text-sm">{selectedAppointment.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Age / Gender</span>
                    <span className="text-slate-700 font-medium">
                      {selectedAppointment.patientAge} Years • {selectedAppointment.patientGender}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Contact Phone</span>
                    <span className="text-slate-700 font-mono font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {selectedAppointment.patientPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Patient Email</span>
                    <span className="text-slate-700 truncate block">
                      {selectedAppointment.patientEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200/60 pb-2">
                  Scheduled Consultation
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Appointment Date</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      {selectedAppointment.appointmentDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Time Slot</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {selectedAppointment.appointmentTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Consultation Type</span>
                    <span className="font-medium text-teal-800">
                      {selectedAppointment.visitType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Assigned Doctor</span>
                    <span className="font-medium text-slate-800">
                      {selectedAppointment.doctorName} ({selectedAppointment.doctorSpecialty})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 text-[11px] block mb-1">Reason / Symptoms</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 text-xs leading-relaxed">
                    {selectedAppointment.symptoms || 'No specific symptoms described. Routine clinical consultation.'}
                  </p>
                </div>
              </div>

              {/* Modal Status Actions */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Update Consultation Outcome
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedAppointment.status !== 'Confirmed' && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'Confirmed')}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Set Confirmed</span>
                    </button>
                  )}

                  {selectedAppointment.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'Completed')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Completed</span>
                    </button>
                  )}

                  {selectedAppointment.status !== 'Rejected' && (
                    <button
                      type="button"
                      onClick={() => requestDestructiveStatusChange(selectedAppointment, 'Rejected')}
                      className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Appointment</span>
                    </button>
                  )}

                  {selectedAppointment.status !== 'Cancelled' && (
                    <button
                      type="button"
                      onClick={() => requestDestructiveStatusChange(selectedAppointment, 'Cancelled')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Slot</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Slip Print / Download actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadAppointmentSlip(selectedAppointment)}
                    className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => printAppointmentSlip(selectedAppointment)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION DIALOG (For Destructive Actions: Reject / Cancel)
          ========================================================================= */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-center font-bold text-base text-slate-900 font-['Outfit']">
              Confirm {confirmDialog.actionType === 'Rejected' ? 'Rejection' : 'Cancellation'}
            </h3>
            <p className="text-center text-xs text-slate-500 mt-1">
              Are you sure you want to mark the appointment for{' '}
              <strong className="text-slate-800">{confirmDialog.patientName}</strong> as{' '}
              <strong className="text-red-600">{confirmDialog.actionType}</strong>? 
              This will update the hospital scheduling system and notify the patient.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, appointmentId: '', patientName: '', actionType: 'Rejected' })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleConfirmDestructiveAction}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Confirm {confirmDialog.actionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
