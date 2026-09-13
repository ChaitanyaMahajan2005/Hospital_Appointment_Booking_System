import React, { useState } from 'react';
import { Department, Doctor, Appointment } from '../types';
import {
  X,
  PlusCircle,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Stethoscope,
  Building2,
  AlertCircle,
  Download,
  Printer
} from 'lucide-react';
import { downloadAppointmentSlip, printAppointmentSlip } from '../utils/appointmentSlip';

interface AdminAddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  doctors: Doctor[];
  onAddBooking: (appointment: Appointment) => Promise<void> | void;
}

export const AdminAddBookingModal: React.FC<AdminAddBookingModalProps> = ({
  isOpen,
  onClose,
  departments,
  doctors,
  onAddBooking,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || '');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  
  // Get tomorrow's date or today's date formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(todayStr);
  const [timeSlot, setTimeSlot] = useState<string>('09:30 AM - 10:00 AM');

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [visitType, setVisitType] = useState<Appointment['visitType']>('New Consultation');
  const [symptoms, setSymptoms] = useState('');
  const [tokenNumber, setTokenNumber] = useState(`OPD-ADM-${Math.floor(100 + Math.random() * 900)}`);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  if (!isOpen) return null;

  // Filter doctors by selected department
  const filteredDoctors = doctors.filter((d) => !selectedDeptId || d.departmentId === selectedDeptId);
  const activeDoctor = doctors.find((d) => d.id === selectedDocId) || filteredDoctors[0];

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const docInDept = doctors.find((d) => d.departmentId === deptId);
    if (docInDept) {
      setSelectedDocId(docInDept.id);
      if (docInDept.timeSlots.length > 0) {
        setTimeSlot(docInDept.timeSlots[0]);
      }
    } else {
      setSelectedDocId('');
    }
  };

  const handleDocChange = (docId: string) => {
    setSelectedDocId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc && doc.timeSlots.length > 0) {
      setTimeSlot(doc.timeSlots[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientName.trim()) {
      setError('Please provide patient name.');
      return;
    }
    const ageNum = parseInt(patientAge, 10);
    if (!patientAge || isNaN(ageNum) || ageNum < 1 || ageNum > 125) {
      setError('Please enter a valid age between 1 and 125.');
      return;
    }
    const cleanPhone = patientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile contact number.');
      return;
    }
    if (!activeDoctor) {
      setError('Please select a doctor for consultation.');
      return;
    }

    setIsSubmitting(true);

    const newAppointment: Appointment = {
      id: `MYH-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: patientName.trim(),
      patientAge: ageNum,
      patientGender,
      patientPhone: cleanPhone,
      patientEmail: patientEmail.trim() || 'walkin@myhospital.org',
      departmentId: activeDoctor.departmentId,
      departmentName: activeDoctor.departmentName,
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      doctorSpecialty: activeDoctor.specialty,
      appointmentDate: date,
      appointmentTime: timeSlot,
      visitType,
      symptoms: symptoms.trim() || 'Direct Admin Walk-in / OPD Registration',
      status: 'Confirmed',
      tokenNumber: tokenNumber.trim() || `OPD-ADM-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };

    try {
      await onAddBooking(newAppointment);
      setCreatedAppointment(newAppointment);
    } catch (err: any) {
      setError(err?.message || 'Failed to save appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCreatedAppointment(null);
    setPatientName('');
    setPatientAge('');
    setPatientPhone('');
    setPatientEmail('');
    setSymptoms('');
    setTokenNumber(`OPD-ADM-${Math.floor(100 + Math.random() * 900)}`);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-700/60 text-teal-200">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Admin: Add New OPD Booking</h3>
              <p className="text-xs text-teal-200/80">Direct hospital registration & official token generation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdAppointment ? (
          /* Confirmation State */
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Booking Registered Successfully!</h4>
            <p className="text-sm text-slate-600 mt-1">
              Token <span className="font-bold text-teal-700">{createdAppointment.tokenNumber}</span> created for patient{' '}
              <span className="font-semibold text-slate-800">{createdAppointment.patientName}</span>.
            </p>

            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs grid grid-cols-2 gap-2.5 max-w-md mx-auto">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Doctor:</span>
                <span className="font-semibold text-slate-800">{createdAppointment.doctorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Department:</span>
                <span className="font-semibold text-slate-800">{createdAppointment.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time:</span>
                <span className="font-semibold text-slate-800">{createdAppointment.appointmentDate} at {createdAppointment.appointmentTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Booking ID:</span>
                <span className="font-mono text-slate-700 font-semibold">{createdAppointment.id}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                type="button"
                id="admin-download-slip-btn"
                onClick={() => downloadAppointmentSlip(createdAppointment, activeDoctor?.roomLocation)}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Patient Slip</span>
              </button>
              <button
                type="button"
                id="admin-print-slip-btn"
                onClick={() => printAppointmentSlip(createdAppointment, activeDoctor?.roomLocation)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Department & Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  Department *
                </label>
                <select
                  id="admin-dept-select"
                  value={selectedDeptId}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  Consulting Doctor *
                </label>
                <select
                  id="admin-doctor-select"
                  value={selectedDocId || activeDoctor?.id || ''}
                  onChange={(e) => handleDocChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                >
                  {filteredDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialty})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time Slot & Token */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  Appointment Date *
                </label>
                <input
                  type="date"
                  id="admin-date-input"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  Time Slot *
                </label>
                <select
                  id="admin-time-select"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                >
                  {(activeDoctor?.timeSlots?.length ? activeDoctor.timeSlots : [
                    '09:00 AM - 09:30 AM',
                    '09:30 AM - 10:00 AM',
                    '10:00 AM - 10:30 AM',
                    '10:30 AM - 11:00 AM',
                    '11:00 AM - 11:30 AM',
                    '11:30 AM - 12:00 PM',
                    '02:00 PM - 02:30 PM',
                    '02:30 PM - 03:00 PM',
                    '04:00 PM - 04:30 PM',
                  ]).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  Token Number *
                </label>
                <input
                  type="text"
                  id="admin-token-input"
                  value={tokenNumber}
                  onChange={(e) => setTokenNumber(e.target.value)}
                  placeholder="e.g. OPD-ADM-102"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-semibold text-teal-800"
                  required
                />
              </div>
            </div>

            {/* Patient Name, Age, Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  Patient Name *
                </label>
                <input
                  type="text"
                  id="admin-patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Full legal name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  id="admin-patient-age"
                  min="1"
                  max="125"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 34"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gender *
                </label>
                <select
                  id="admin-patient-gender"
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="admin-patient-phone"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  Patient Email (Optional)
                </label>
                <input
                  type="email"
                  id="admin-patient-email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>
            </div>

            {/* Visit Type & Symptoms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consultation Visit Type
                </label>
                <select
                  id="admin-visit-type"
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                >
                  <option value="New Consultation">New Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Second Opinion">Second Opinion</option>
                  <option value="Routine Health Check">Routine Health Check</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Symptoms / Chief Complaint
                </label>
                <input
                  type="text"
                  id="admin-symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Fever, persistent cough, regular checkup"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="admin-confirm-booking-btn"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Book Appointment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
