import React, { useState, useEffect } from 'react';
import { Department, Doctor, Appointment } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Stethoscope,
  Building2,
  DollarSign,
  MapPin,
  Star,
  Printer,
  CalendarCheck,
  Award,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  LogIn,
  Download,
  Check
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { useAuth } from '../context/AuthContext';
import { downloadAppointmentSlip, printAppointmentSlip } from '../utils/appointmentSlip';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  doctors: Doctor[];
  preselectedDoctorId?: string;
  preselectedDepartmentId?: string;
  onAppointmentBooked: (appointment: Appointment) => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  departments,
  doctors,
  preselectedDoctorId,
  preselectedDepartmentId,
  onAppointmentBooked,
}) => {
  const { currentUser, userProfile, openAuthModal } = useAuth();

  // Form State
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [visitType, setVisitType] = useState<Appointment['visitType']>('New Consultation');

  // Patient Fields
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [symptoms, setSymptoms] = useState('');

  // UI state
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Dept/Doc & Time, 2: Patient Info, 3: Success Slip
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [downloadedSlip, setDownloadedSlip] = useState(false);

  // Auto-fill from authenticated user profile when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      if (!patientName && (userProfile?.displayName || currentUser.displayName)) {
        setPatientName(userProfile?.displayName || currentUser.displayName || '');
      }
      if (!patientEmail && currentUser.email) {
        setPatientEmail(currentUser.email);
      }
      if (!patientPhone && userProfile?.phone) {
        setPatientPhone(userProfile.phone);
      }
    }
  }, [isOpen, currentUser?.uid]);

  // Initialize or reset when modal opens or preselection changes
  useEffect(() => {
    if (isOpen) {
      if (preselectedDoctorId) {
        const doc = doctors.find((d) => d.id === preselectedDoctorId);
        if (doc) {
          setSelectedDocId(doc.id);
          setSelectedDeptId(doc.departmentId);
          if (doc.timeSlots.length > 0) {
            setAppointmentTime(doc.timeSlots[0]);
          }
        }
      } else if (preselectedDepartmentId) {
        setSelectedDeptId(preselectedDepartmentId);
        const docsInDept = doctors.filter((d) => d.departmentId === preselectedDepartmentId);
        if (docsInDept.length > 0) {
          setSelectedDocId(docsInDept[0].id);
          if (docsInDept[0].timeSlots.length > 0) {
            setAppointmentTime(docsInDept[0].timeSlots[0]);
          }
        }
      } else {
        // Default to first department
        if (departments.length > 0) {
          setSelectedDeptId(departments[0].id);
          const docsInDept = doctors.filter((d) => d.departmentId === departments[0].id);
          if (docsInDept.length > 0) {
            setSelectedDocId(docsInDept[0].id);
            if (docsInDept[0].timeSlots.length > 0) {
              setAppointmentTime(docsInDept[0].timeSlots[0]);
            }
          }
        }
      }

      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setAppointmentDate(`${yyyy}-${mm}-${dd}`);

      setStep(1);
      setConfirmedAppointment(null);
      setValidationError(null);
    }
  }, [isOpen, preselectedDoctorId, preselectedDepartmentId, departments, doctors]);

  // When department changes, update doctors list
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const availableDocs = doctors.filter((d) => d.departmentId === deptId);
    if (availableDocs.length > 0) {
      setSelectedDocId(availableDocs[0].id);
      if (availableDocs[0].timeSlots.length > 0) {
        setAppointmentTime(availableDocs[0].timeSlots[0]);
      }
    } else {
      setSelectedDocId('');
      setAppointmentTime('');
    }
  };

  // When doctor changes, default to first time slot
  const handleDoctorChange = (docId: string) => {
    setSelectedDocId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc && doc.timeSlots.length > 0) {
      setAppointmentTime(doc.timeSlots[0]);
    }
  };

  const currentDepartment = departments.find((d) => d.id === selectedDeptId);
  const currentDoctor = doctors.find((d) => d.id === selectedDocId);
  const departmentDoctors = doctors.filter((d) => d.departmentId === selectedDeptId);

  // Validate Step 1
  const handleProceedToStep2 = () => {
    if (!selectedDeptId) {
      setValidationError('Please select a department.');
      return;
    }
    if (!selectedDocId) {
      setValidationError('Please select a doctor.');
      return;
    }
    if (!appointmentDate) {
      setValidationError('Please select an appointment date.');
      return;
    }
    if (!appointmentTime) {
      setValidationError('Please choose a preferred time slot.');
      return;
    }

    // Check if chosen day of week matches doctor availability
    if (currentDoctor && appointmentDate) {
      const parts = appointmentDate.split('-');
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = days[dateObj.getDay()];
      if (!currentDoctor.availabilityDays.includes(dayName)) {
        setValidationError(
          `Dr. ${currentDoctor.name} is not available on ${dayName}. Available days are: ${currentDoctor.availabilityDays.join(', ')}.`
        );
        return;
      }
    }

    setValidationError(null);
    setStep(2);
  };

  // Submit appointment
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setValidationError('Please sign in or create an account to finalize and save your booking.');
      openAuthModal('signin');
      return;
    }

    if (!patientName.trim()) {
      setValidationError('Please enter the patient’s full name.');
      return;
    }
    if (!patientPhone.trim()) {
      setValidationError('Please enter a valid phone number.');
      return;
    }
    if (!patientEmail.trim() || !patientEmail.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!patientAge || Number(patientAge) <= 0 || Number(patientAge) > 125) {
      setValidationError('Please enter a valid age.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tokenSuffix = Math.floor(10 + Math.random() * 89);
    const deptPrefix = (currentDepartment?.name || 'GEN').substring(0, 3).toUpperCase();

    const newAppointment: Appointment = {
      id: `MYH-${randomSuffix}`,
      userId: currentUser.uid,
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim(),
      patientPhone: patientPhone.trim(),
      patientAge: Number(patientAge),
      patientGender,
      departmentId: selectedDeptId,
      departmentName: currentDepartment?.name || 'General Medicine',
      doctorId: selectedDocId,
      doctorName: currentDoctor?.name || 'Consultant Specialist',
      doctorSpecialty: currentDoctor?.specialty || 'General Health',
      appointmentDate,
      appointmentTime,
      visitType,
      symptoms: symptoms.trim() || 'General health consultation',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      tokenNumber: `${deptPrefix}-${tokenSuffix}`,
    };

    onAppointmentBooked(newAppointment);
    setConfirmedAppointment(newAppointment);
    setValidationError(null);
    setStep(3);
  };

  const handlePrint = () => {
    if (confirmedAppointment) {
      printAppointmentSlip(confirmedAppointment, currentDoctor?.roomLocation);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="appointment-booking-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="appointment-booking-modal-container"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 border border-white/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-['Outfit']">
                  M. Y. Hospital Appointment
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 font-semibold border border-teal-300/30">
                  Instant Confirmation
                </span>
              </div>
              <p className="text-xs text-teal-100/80">
                Book a consultation with our verified department specialists
              </p>
            </div>
          </div>

          <button
            id="close-booking-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Doctor & Schedule
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Patient Details
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                step === 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Confirmed Slip
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {validationError && (
          <div className="m-5 mb-0 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1">{validationError}</div>
          </div>
        )}

        {/* Step 1: Doctor & Schedule Selection */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Department Dropdown */}
              <div>
                <label
                  htmlFor="booking-department-select"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  1. Select Clinical Department *
                </label>
                <select
                  id="booking-department-select"
                  value={selectedDeptId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {currentDepartment && (
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <span>Head:</span>{' '}
                    <span className="font-medium text-slate-700">
                      {currentDepartment.headOfDepartment}
                    </span>
                  </p>
                )}
              </div>

              {/* Doctor Dropdown (Multiple doctors per department requirement) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="booking-doctor-select"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    2. Choose Specialist Doctor *
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">
                    {departmentDoctors.length} Doctors Available
                  </span>
                </div>
                <select
                  id="booking-doctor-select"
                  value={selectedDocId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                >
                  {departmentDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Doctor Summary Card */}
            {currentDoctor && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentDoctor.photoUrl}
                    alt={currentDoctor.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{currentDoctor.name}</h4>
                    </div>
                    <p className="text-xs text-teal-700 font-medium">{currentDoctor.title}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {currentDoctor.roomLocation || 'M. Y. Hospital, Indore'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-slate-400" />
                        {currentDoctor.experienceBadge || (currentDoctor.experienceYears ? `${currentDoctor.experienceYears} Years Exp` : 'Experienced')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    CONSULTATION
                  </span>
                  <span className="text-base font-extrabold text-slate-900 block">
                    Hospital Service
                  </span>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    Available: {currentDoctor.availabilityText || currentDoctor.availabilityDays.join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Date and Time Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label
                  htmlFor="booking-date-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  3. Select Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="booking-date-input"
                    value={appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Doctor consults on:{' '}
                  <span className="font-semibold text-slate-700">
                    {currentDoctor?.availabilityDays.join(', ')}
                  </span>
                </p>
              </div>

              <div>
                <label
                  htmlFor="booking-visit-type"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  4. Type of Consultation *
                </label>
                <select
                  id="booking-visit-type"
                  value={visitType}
                  onChange={(e) =>
                    setVisitType(e.target.value as Appointment['visitType'])
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                >
                  <option value="New Consultation">First-Time Patient Consultation</option>
                  <option value="Follow-up">Post-Procedure / Follow-up Visit</option>
                  <option value="Second Opinion">Specialist Second Opinion</option>
                  <option value="Routine Health Check">Routine Preventive Health Check</option>
                </select>
              </div>
            </div>

            {/* Time Slot Radio Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                5. Select Available Time Slot *
              </label>
              {currentDoctor?.timeSlots && currentDoctor.timeSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {currentDoctor.timeSlots.map((slot) => {
                    const isSelected = appointmentTime === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        id={`time-slot-${slot.replace(/\s+/g, '-')}`}
                        onClick={() => setAppointmentTime(slot)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50/50'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-amber-600">
                  No slots currently available for this doctor. Please choose another date or doctor.
                </p>
              )}
            </div>

            {/* Step 1 Footer Action */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                id="step1-cancel-btn"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                id="step1-proceed-btn"
                onClick={handleProceedToStep2}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-bold shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Patient Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Patient Details Form */}
        {step === 2 && (
          <form onSubmit={handleConfirmBooking} className="p-6 space-y-5">
            {/* Patient Authentication Status Banner */}
            {currentUser ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {(userProfile?.displayName || currentUser.displayName || currentUser.email || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      Logged in as {userProfile?.displayName || currentUser.displayName || 'Registered Patient'}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {currentUser.email} • Booking will be securely synced to your cloud account
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Account Linked</span>
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sign in is required to book and track your appointments</span>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}

            {/* Quick appointment summary banner */}
            <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 text-xs text-teal-900 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-bold">Consulting:</span> {currentDoctor?.name} (
                {currentDepartment?.name})
              </div>
              <div>
                <span className="font-bold">Schedule:</span> {appointmentDate} at {appointmentTime}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Name */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="patient-name-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Patient Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    id="patient-name-input"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Eleanor Watson"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Patient Phone */}
              <div>
                <label
                  htmlFor="patient-phone-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Contact Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    id="patient-phone-input"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  SMS token & reminders will be dispatched here
                </span>
              </div>

              {/* Patient Email */}
              <div>
                <label
                  htmlFor="patient-email-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    id="patient-email-input"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="eleanor@example.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Confirmation slip & receipt
                </span>
              </div>

              {/* Patient Age */}
              <div>
                <label
                  htmlFor="patient-age-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Patient Age *
                </label>
                <input
                  type="number"
                  id="patient-age-input"
                  value={patientAge}
                  min={1}
                  max={120}
                  onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 42"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              {/* Patient Gender */}
              <div>
                <label
                  htmlFor="patient-gender-select"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Gender *
                </label>
                <select
                  id="patient-gender-select"
                  value={patientGender}
                  onChange={(e) =>
                    setPatientGender(e.target.value as 'Male' | 'Female' | 'Other')
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Symptoms / Notes */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="patient-symptoms-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Brief Symptoms or Consultation Notes (Optional)
                </label>
                <textarea
                  id="patient-symptoms-input"
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your current discomfort, duration of symptoms, or any previous medical history..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                ></textarea>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                id="step2-back-btn"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                id="step2-confirm-booking-btn"
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-bold shadow-md shadow-teal-600/25 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Generate Booking Pass</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Confirmation Slip */}
        {step === 3 && confirmedAppointment && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                Appointment Successfully Scheduled!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your consultation token is active at M. Y. Hospital. An SMS and email confirmation have been logged.
              </p>
            </div>

            {/* Printable Pass Ticket */}
            <div
              id="appointment-print-pass"
              className="bg-slate-50 border-2 border-dashed border-teal-300/80 rounded-2xl p-5 sm:p-6 space-y-4 relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-['Outfit'] font-extrabold text-slate-900 text-sm tracking-tight">
                    M. Y. HOSPITAL
                  </span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold">
                    OPD PASS
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Booking ID
                  </span>
                  <span className="text-sm font-mono font-bold text-teal-700">
                    {confirmedAppointment.id}
                  </span>
                </div>
              </div>

              {/* Token & Schedule */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 bg-white rounded-xl p-3 border border-slate-200/70">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Token No
                  </span>
                  <span className="text-base font-extrabold text-teal-600">
                    {confirmedAppointment.tokenNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Date
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {confirmedAppointment.appointmentDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Slot Time
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {confirmedAppointment.appointmentTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Status
                  </span>
                  <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Confirmed
                  </span>
                </div>
              </div>

              {/* Doctor & Patient Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Doctor & Department
                  </span>
                  <p className="font-bold text-slate-900">{confirmedAppointment.doctorName}</p>
                  <p className="text-slate-600">{confirmedAppointment.departmentName}</p>
                  <p className="text-teal-700 font-medium">{currentDoctor?.roomLocation}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Patient Details
                  </span>
                  <p className="font-bold text-slate-900">
                    {confirmedAppointment.patientName} ({confirmedAppointment.patientAge}y,{' '}
                    {confirmedAppointment.patientGender})
                  </p>
                  <p className="text-slate-600">{confirmedAppointment.patientPhone}</p>
                  <p className="text-slate-500">{confirmedAppointment.patientEmail}</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p>
                  • Please arrive at M. Y. Hospital OPD 15 minutes prior to your scheduled slot for vital checks.
                </p>
                <p>• Bring previous test reports, prescription records, and insurance cards if applicable.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="download-appointment-pass-btn"
                  onClick={() => {
                    if (confirmedAppointment) {
                      downloadAppointmentSlip(confirmedAppointment, currentDoctor?.roomLocation);
                      setDownloadedSlip(true);
                      setTimeout(() => setDownloadedSlip(false), 3000);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 active:bg-teal-200 border border-teal-300 text-teal-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  {downloadedSlip ? (
                    <>
                      <Check className="w-4 h-4 text-teal-600" />
                      <span>Slip Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-teal-700" />
                      <span>Download Slip</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="print-appointment-pass-btn"
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Slip</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="book-another-btn"
                  onClick={() => {
                    setStep(1);
                    setConfirmedAppointment(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Book Another
                </button>
                <button
                  type="button"
                  id="finish-booking-btn"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
