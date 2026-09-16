import React, { useState, useMemo } from 'react';
import { Appointment, Department, Doctor } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  LogOut,
  PlusCircle,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Clock3,
  Trash2,
  ChevronDown,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  Stethoscope,
  Award
} from 'lucide-react';
import {
  updateAppointmentStatusInFirestore,
  deleteAppointmentFromFirestore,
  updateDoctorStatusInFirestore,
  ADMIN_EMAIL
} from '../lib/firebase';
import { downloadAppointmentSlip, printAppointmentSlip } from '../utils/appointmentSlip';
import { AdminAddBookingModal } from '../components/AdminAddBookingModal';
import { AdminAddDoctorModal } from '../components/AdminAddDoctorModal';
import { AdminEditDoctorModal } from '../components/AdminEditDoctorModal';
import { DoctorDetailModal } from '../components/DoctorDetailModal';

interface AdminPageProps {
  appointments: Appointment[];
  departments: Department[];
  doctors: Doctor[];
  onNavigateHome: () => void;
  onAppointmentUpdated: (updatedAppointments: Appointment[]) => void;
  onDoctorAdded?: (doctor: Doctor) => void;
  onDoctorUpdated?: (doctor: Doctor) => void;
  onOpenBooking: () => void;
  showToast: (msg: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  appointments,
  departments,
  doctors,
  onNavigateHome,
  onAppointmentUpdated,
  onDoctorAdded,
  onDoctorUpdated,
  showToast,
}) => {
  const { currentUser, isAdmin, loginWithEmail, logout } = useAuth();

  // Login form state - clean and secure (NO hardcoded credentials or autofill)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Section Tab: Appointments vs Doctors Management
  const [adminTab, setAdminTab] = useState<'appointments' | 'doctors'>('appointments');

  // Admin action modal states
  const [addBookingModalOpen, setAddBookingModalOpen] = useState(false);
  const [addDoctorModalOpen, setAddDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [activeDoctorDetail, setActiveDoctorDetail] = useState<Doctor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Toggle Doctor Active/Inactive status
  const handleToggleDoctorStatus = async (doc: Doctor) => {
    const nextStatus = doc.status === 'inactive' ? 'active' : 'inactive';
    try {
      await updateDoctorStatusInFirestore(doc.id, nextStatus);
      const updated = { ...doc, status: nextStatus };
      if (onDoctorUpdated) {
        onDoctorUpdated(updated);
      }
      showToast(`Doctor Dr. ${doc.name.replace(/^Dr\.\s*/, '')} status updated to ${nextStatus}.`);
    } catch (err: any) {
      console.error('Error toggling doctor status:', err);
      showToast(err?.message || 'Failed to update doctor status.');
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Confirmed' | 'Completed' | 'Cancelled'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState<string>('');

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      await loginWithEmail(emailInput.trim(), passwordInput);
      if (emailInput.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setLoginError(`Signed in as ${emailInput}, but this account does not have Administrator privileges.`);
      } else {
        showToast('Welcome, Administrator. Admin Portal unlocked.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setLoginError(err?.message || 'Invalid credentials. Please verify your admin email and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Status Change Handler
  const handleStatusChange = async (appointmentId: string, newStatus: 'Confirmed' | 'Completed' | 'Cancelled') => {
    setActionLoadingId(appointmentId);
    try {
      const updated = appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: newStatus } : a
      );
      onAppointmentUpdated(updated);

      await updateAppointmentStatusInFirestore(appointmentId, newStatus);
      showToast(`Appointment ${appointmentId} updated to ${newStatus}.`);
    } catch (err: any) {
      console.error('Status update error:', err);
      showToast('Failed to update status in cloud database.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete / Archive Appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    setActionLoadingId(appointmentId);
    try {
      const updated = appointments.filter((a) => a.id !== appointmentId);
      onAppointmentUpdated(updated);

      await deleteAppointmentFromFirestore(appointmentId);
      showToast(`Appointment ${appointmentId} has been deleted.`);
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast('Failed to delete appointment from database.');
    } finally {
      setActionLoadingId(null);
      setDeletingId(null);
    }
  };

  // Add new booking from admin
  const handleAddBookingFromAdmin = async (newAppointment: Appointment) => {
    const updated = [newAppointment, ...appointments.filter((a) => a.id !== newAppointment.id)];
    onAppointmentUpdated(updated);

    try {
      const { saveAppointmentToFirestore } = await import('../lib/firebase');
      await saveAppointmentToFirestore({
        ...newAppointment,
        userId: currentUser?.uid || 'admin',
      });
    } catch (err) {
      console.warn('Could not save to firestore:', err);
    }
    showToast(`New booking ${newAppointment.id} created for ${newAppointment.patientName}.`);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredAppointments.length === 0) {
      showToast('No records to export with current filters.');
      return;
    }

    const headers = [
      'Token Number',
      'Booking ID',
      'Patient Name',
      'Age',
      'Gender',
      'Phone',
      'Email',
      'Doctor Name',
      'Department',
      'Appointment Date',
      'Time Slot',
      'Visit Type',
      'Status',
      'Symptoms',
      'Created At'
    ];

    const rows = filteredAppointments.map((a) => [
      `"${a.tokenNumber || ''}"`,
      `"${a.id}"`,
      `"${a.patientName.replace(/"/g, '""')}"`,
      a.patientAge,
      a.patientGender,
      `"${a.patientPhone}"`,
      `"${a.patientEmail || ''}"`,
      `"${a.doctorName.replace(/"/g, '""')}"`,
      `"${a.departmentName.replace(/"/g, '""')}"`,
      `"${a.appointmentDate}"`,
      `"${a.appointmentTime}"`,
      `"${a.visitType}"`,
      `"${a.status}"`,
      `"${(a.symptoms || '').replace(/"/g, '""')}"`,
      `"${a.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MYH_Admin_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported bookings to CSV file.');
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'Confirmed').length;
    const completed = appointments.filter((a) => a.status === 'Completed').length;
    const cancelled = appointments.filter((a) => a.status === 'Cancelled').length;
    const todayCount = appointments.filter((a) => a.appointmentDate === todayStr).length;

    return { total, confirmed, completed, cancelled, todayCount };
  }, [appointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return appointments.filter((apt) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          apt.patientName.toLowerCase().includes(q) ||
          apt.id.toLowerCase().includes(q) ||
          apt.tokenNumber?.toLowerCase().includes(q) ||
          apt.patientPhone.includes(q) ||
          apt.doctorName.toLowerCase().includes(q) ||
          apt.departmentName.toLowerCase().includes(q) ||
          (apt.symptoms && apt.symptoms.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Status
      if (statusFilter !== 'ALL' && apt.status !== statusFilter) {
        return false;
      }

      // 3. Department
      if (departmentFilter !== 'ALL' && apt.departmentId !== departmentFilter) {
        return false;
      }

      // 4. Date
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
  }, [appointments, searchQuery, statusFilter, departmentFilter, dateFilter, customDate]);

  /* =========================================================================
     VIEW 1: ADMIN LOGIN GATE (If not logged in as admin)
     ========================================================================= */
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-900/5 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] tracking-tight">Executive Admin Portal</h2>
            <p className="text-xs text-slate-300 mt-1">
              Maharaja Yeshwantrao Hospital Administrative Control
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-[11px] font-medium">
              <Lock className="w-3 h-3" />
              <span>Restricted to Authorized Hospital Administrators</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* If signed in as non-admin */}
            {currentUser && !isAdmin && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Access Restricted</p>
                  <p className="text-amber-800 mt-0.5">
                    Currently signed in as <span className="font-semibold">{currentUser.email}</span>. This account does not have hospital administrative rights.
                  </p>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="mt-2 text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                  >
                    Sign out to login as Administrator &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Admin Email Address
                </label>
                <input
                  type="email"
                  id="admin-login-email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@myhospital.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-login-password"
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
                id="admin-submit-login-btn"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-900/10 disabled:opacity-50 transition-colors"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Administrator...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Login to Admin Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Public Site */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                id="admin-back-to-home-btn"
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
     VIEW 2: FULL ADMIN DASHBOARD (When authenticated as admin)
     ========================================================================= */
  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Admin Action Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold font-['Outfit'] tracking-tight">
                    Hospital Administration Portal
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                    Official Admin
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Signed in as <span className="text-teal-300 font-mono font-medium">{currentUser?.email}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                id="admin-open-add-doctor-btn"
                onClick={() => setAddDoctorModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/20 transition-all"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Add Doctor Account</span>
              </button>

              <button
                type="button"
                id="admin-open-add-booking-btn"
                onClick={() => setAddBookingModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Booking</span>
              </button>

              <button
                type="button"
                id="admin-export-csv-btn"
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Export current bookings to CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                type="button"
                id="admin-exit-to-portal-btn"
                onClick={onNavigateHome}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Public Site</span>
              </button>

              <button
                type="button"
                id="admin-logout-btn"
                onClick={async () => {
                  await logout();
                  showToast('Admin logged out successfully.');
                }}
                className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Logout admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs: Appointments vs Doctor Management */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
          <button
            type="button"
            id="admin-tab-appointments"
            onClick={() => setAdminTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              adminTab === 'appointments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Patient Bookings ({appointments.length})</span>
          </button>
          <button
            type="button"
            id="admin-tab-doctors"
            onClick={() => setAdminTab('doctors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              adminTab === 'doctors'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span>Doctors Directory & Accounts ({doctors.length})</span>
          </button>
        </div>

        {adminTab === 'doctors' ? (
          /* Doctors Directory and Accounts Management View */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <span>Hospital Doctor Accounts & Directory</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage medical staff profiles and provision access to the Doctor Workstation Portal
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddDoctorModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Register New Doctor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => {
                const docApts = appointments.filter(
                  (a) => a.doctorId === doc.id || a.doctorName.includes(doc.name.replace('Dr.', '').trim())
                );
                return (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
                      doc.status === 'inactive' ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={doc.photoUrl}
                            alt={doc.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
                            <p className="text-xs text-teal-700 font-semibold">{doc.title}</p>
                            <p className="text-[11px] text-slate-500">{doc.departmentName}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            doc.status === 'inactive'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {doc.status === 'inactive' ? 'Inactive' : 'Active'}
                        </span>
                      </div>

                      <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Specialty:</span>
                          <span className="font-medium text-slate-800">{doc.specialty}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Qualifications:</span>
                          <span className="font-medium text-slate-800">{doc.qualification || doc.degrees?.join(', ') || 'MBBS, MD'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">OPD Location:</span>
                          <span className="font-medium text-slate-800">{doc.roomLocation || 'OPD Chambers'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Portal Email:</span>
                          <span className="font-mono text-[11px] text-teal-800">
                            {doc.email || 'doctor@myhospital.org'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Schedule:</span>
                          <span className="font-medium text-slate-800 text-[11px]">{doc.availabilityText || 'Mon - Sat'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-medium">
                          <strong>{docApts.length}</strong> assigned bookings
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {doc.id}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        {/* Toggle Status Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleDoctorStatus(doc)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                            doc.status === 'inactive'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                          title={doc.status === 'inactive' ? 'Activate doctor' : 'Pause doctor from bookings'}
                        >
                          {doc.status === 'inactive' ? 'Activate' : 'Deactivate'}
                        </button>

                        {/* Edit Doctor Profile Button */}
                        <button
                          type="button"
                          onClick={() => setEditingDoctor(doc)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Edit Profile
                        </button>

                        {/* View Details Modal */}
                        <button
                          type="button"
                          onClick={() => setActiveDoctorDetail(doc)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 text-[11px] font-semibold cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Bookings Tab Content */
          <>
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Bookings
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {metrics.total}
            </span>
            <span className="text-[10px] text-slate-500">All registered appointments</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs bg-teal-50/20">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-600" />
              Confirmed
            </span>
            <span className="text-2xl font-extrabold text-teal-800 mt-1 block">
              {metrics.confirmed}
            </span>
            <span className="text-[10px] text-teal-600/80">Active upcoming slots</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block flex items-center gap-1">
              <Clock3 className="w-3 h-3 text-blue-600" />
              Completed
            </span>
            <span className="text-2xl font-extrabold text-blue-800 mt-1 block">
              {metrics.completed}
            </span>
            <span className="text-[10px] text-blue-600/80">Consultations fulfilled</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-600" />
              Cancelled
            </span>
            <span className="text-2xl font-extrabold text-rose-800 mt-1 block">
              {metrics.cancelled}
            </span>
            <span className="text-[10px] text-rose-600/80">Archived / Cancelled</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-600" />
              Today's OPD
            </span>
            <span className="text-2xl font-extrabold text-amber-800 mt-1 block">
              {metrics.todayCount}
            </span>
            <span className="text-[10px] text-amber-600/80">Scheduled for today</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="admin-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, token, booking ID, phone, doctor, or symptoms..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Status:
              </span>
              {(['ALL', 'Confirmed', 'Completed', 'Cancelled'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Department & Date Secondary Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Department Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Department:</span>
              <select
                id="admin-filter-dept-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-teal-500"
              >
                <option value="ALL">All Departments ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Quick Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Date:</span>
              <select
                id="admin-filter-date-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-teal-500"
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Today Only</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="CUSTOM">Specific Date...</option>
              </select>

              {dateFilter === 'CUSTOM' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-2 py-0.5 rounded-lg border border-slate-300 text-xs"
                />
              )}
            </div>

            {/* Results Count & Reset */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-slate-500">
                Showing <strong className="text-slate-800">{filteredAppointments.length}</strong> of{' '}
                {appointments.length}
              </span>
              {(searchQuery || statusFilter !== 'ALL' || departmentFilter !== 'ALL' || dateFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setDepartmentFilter('ALL');
                    setDateFilter('ALL');
                    setCustomDate('');
                  }}
                  className="text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bookings Management Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>All Patient Bookings</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                {filteredAppointments.length}
              </span>
            </h2>
            <div className="text-xs text-slate-400">
              Real-time synchronized with cloud records
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No Bookings Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No appointment matches your search criteria. Try modifying your search or click below to register a new walk-in.
              </p>
              <button
                type="button"
                onClick={() => setAddBookingModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Booking Now</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Token & ID</th>
                    <th className="py-3 px-4">Patient Information</th>
                    <th className="py-3 px-4">Doctor & Department</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions & Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => {
                    const isCancelled = apt.status === 'Cancelled';
                    const isCompleted = apt.status === 'Completed';
                    const isConfirmed = apt.status === 'Confirmed';

                    return (
                      <tr
                        key={apt.id}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          isCancelled ? 'bg-slate-50/30 text-slate-400' : ''
                        }`}
                      >
                        {/* Token & ID */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="inline-block px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-xs">
                            {apt.tokenNumber || 'TOKEN'}
                          </div>
                          <p className="font-mono text-[10px] text-slate-400 mt-1">{apt.id}</p>
                          <span className="text-[10px] text-slate-400 block">
                            {apt.visitType}
                          </span>
                        </td>

                        {/* Patient Information */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900 text-xs">{apt.patientName}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {apt.patientAge} Yrs • {apt.patientGender}
                          </div>
                          <div className="text-[11px] font-mono text-slate-600 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{apt.patientPhone}</span>
                          </div>
                          {apt.symptoms && (
                            <p className="text-[10px] text-slate-500 italic mt-1 max-w-xs truncate" title={apt.symptoms}>
                              Complaints: {apt.symptoms}
                            </p>
                          )}
                        </td>

                        {/* Doctor & Department */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <Stethoscope className="w-3 h-3 text-teal-600" />
                            <span>{apt.doctorName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {apt.departmentName}
                          </div>
                          <div className="text-[10px] text-teal-700 font-medium mt-0.5">
                            {apt.doctorSpecialty}
                          </div>
                        </td>

                        {/* Schedule */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{apt.appointmentDate}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{apt.appointmentTime}</span>
                          </div>
                        </td>

                        {/* Status & Change Dropdown */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1.5">
                            {/* Current Status Pill */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isConfirmed
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                  : isCompleted
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isConfirmed && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                              {isCompleted && <Clock3 className="w-3 h-3 text-blue-600" />}
                              {isCancelled && <XCircle className="w-3 h-3 text-rose-600" />}
                              <span>{apt.status}</span>
                            </span>

                            {/* Status Modifier Selector */}
                            <div>
                              <select
                                id={`status-select-${apt.id}`}
                                value={apt.status}
                                disabled={actionLoadingId === apt.id}
                                onChange={(e) =>
                                  handleStatusChange(apt.id, e.target.value as any)
                                }
                                className="text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                              >
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Download Slip */}
                            <button
                              type="button"
                              id={`admin-dl-slip-${apt.id}`}
                              onClick={() => downloadAppointmentSlip(apt)}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                              title="Download official OPD consultation pass"
                            >
                              <Download className="w-3 h-3 text-teal-700" />
                              <span>Slip</span>
                            </button>

                            {/* Print Slip */}
                            <button
                              type="button"
                              id={`admin-print-${apt.id}`}
                              onClick={() => printAppointmentSlip(apt)}
                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              title="Print slip"
                            >
                              <Printer className="w-3 h-3 text-slate-400" />
                            </button>

                            {/* Delete Action with inline confirm */}
                            {deletingId === apt.id ? (
                              <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-lg">
                                <span className="text-[10px] font-bold text-red-700">Delete?</span>
                                <button
                                  type="button"
                                  id={`admin-confirm-del-${apt.id}`}
                                  onClick={() => handleDeleteAppointment(apt.id)}
                                  className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(null)}
                                  className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                id={`admin-del-${apt.id}`}
                                onClick={() => setDeletingId(apt.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                title="Delete appointment record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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
      </div>

      {/* Admin Add Booking Modal */}
      <AdminAddBookingModal
        isOpen={addBookingModalOpen}
        onClose={() => setAddBookingModalOpen(false)}
        departments={departments}
        doctors={doctors}
        onAddBooking={handleAddBookingFromAdmin}
      />

      {/* Admin Add Doctor Modal */}
      <AdminAddDoctorModal
        isOpen={addDoctorModalOpen}
        onClose={() => setAddDoctorModalOpen(false)}
        departments={departments}
        onDoctorCreated={(newDoc) => {
          if (onDoctorAdded) {
            onDoctorAdded(newDoc);
          }
          showToast(`Doctor Dr. ${newDoc.name.replace(/^Dr\.\s*/, '')} registered and provisioned.`);
        }}
      />

      {/* Admin Edit Doctor Modal */}
      <AdminEditDoctorModal
        isOpen={!!editingDoctor}
        doctor={editingDoctor}
        departments={departments}
        onClose={() => setEditingDoctor(null)}
        onDoctorUpdated={(updatedDoc) => {
          if (onDoctorUpdated) {
            onDoctorUpdated(updatedDoc);
          }
          showToast(`Doctor Dr. ${updatedDoc.name.replace(/^Dr\.\s*/, '')} profile updated.`);
        }}
      />

      {/* Doctor Detail Inspection Modal */}
      <DoctorDetailModal
        doctor={activeDoctorDetail}
        onClose={() => setActiveDoctorDetail(null)}
        onBook={() => {}}
      />
    </div>
  );
};
