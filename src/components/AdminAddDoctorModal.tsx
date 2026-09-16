import React, { useState } from 'react';
import { Department, Doctor } from '../types';
import {
  X,
  PlusCircle,
  User,
  Mail,
  Phone,
  Stethoscope,
  Building2,
  Award,
  Clock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { saveDoctorToFirestore, saveUserProfile } from '../lib/firebase';

interface AdminAddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onDoctorAdded: (doctor: Doctor) => void;
}

export const AdminAddDoctorModal: React.FC<AdminAddDoctorModalProps> = ({
  isOpen,
  onClose,
  departments,
  onDoctorAdded,
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Senior Consultant');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [specialty, setSpecialty] = useState(departments[0]?.name || '');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [experienceYears, setExperienceYears] = useState('10');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roomLocation, setRoomLocation] = useState('Room 102, OPD Complex');
  const [bio, setBio] = useState('Dedicated clinical specialist committed to patient health and treatment excellence.');
  const [availabilityText, setAvailabilityText] = useState('Mon - Sat, 9:00 AM - 4:00 PM');
  const [timeSlotsInput, setTimeSlotsInput] = useState('09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM');
  const [createAuthAccount, setCreateAuthAccount] = useState(true);
  const [tempPassword, setTempPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ doctorName: string; email: string } | null>(null);

  if (!isOpen) return null;

  const handleDepartmentChange = (deptId: string) => {
    setDepartmentId(deptId);
    const dept = departments.find((d) => d.id === deptId);
    if (dept) {
      setSpecialty(dept.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the doctor’s full name.');
      return;
    }
    if (!departmentId) {
      setError('Please select a clinical department.');
      return;
    }
    if (createAuthAccount && (!email.trim() || !email.includes('@'))) {
      setError('A valid email address is required to create a doctor login account.');
      return;
    }
    if (createAuthAccount && (!tempPassword || tempPassword.length < 6)) {
      setError('Temporary login password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const selectedDept = departments.find((d) => d.id === departmentId);
      const generatedDocId = `doc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      let authUid = '';

      // If requested, provision doctor account in Firebase Auth using a secondary Firebase app instance
      // so the current Admin session is NEVER logged out!
      if (createAuthAccount && email && tempPassword) {
        const secondaryAppName = `doctor-provision-${Date.now()}`;
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);

        try {
          const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth,
            email.trim(),
            tempPassword
          );
          authUid = userCredential.user.uid;
          await signOut(secondaryAuth);
        } catch (authErr: any) {
          if (authErr?.code === 'auth/email-already-in-use') {
            throw new Error(`Email "${email}" is already registered. Please provide another unique email.`);
          }
          throw authErr;
        }
      }

      const parsedTimeSlots = timeSlotsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const newDoctor: Doctor = {
        id: generatedDocId,
        uid: authUid || undefined,
        name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
        title: title.trim() || 'Senior Consultant',
        departmentId,
        departmentName: selectedDept?.name || specialty,
        specialty: specialty.trim() || selectedDept?.name || 'General Medicine',
        experienceYears: Number(experienceYears) || 5,
        experienceBadge: Number(experienceYears) >= 10 ? 'Senior Specialist' : 'Specialist',
        qualification: qualification.trim(),
        degrees: [qualification.trim()],
        rating: 4.8,
        reviewCount: 12,
        consultationFee: 0,
        languages: ['Hindi', 'English'],
        availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        availabilityText: availabilityText.trim(),
        timeSlots: parsedTimeSlots.length > 0 ? parsedTimeSlots : ['09:30 AM', '11:30 AM', '02:00 PM', '04:00 PM'],
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
        bio: bio.trim(),
        roomLocation: roomLocation.trim() || 'OPD Chambers, MY Hospital',
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        status: 'active',
      };

      // 1. Save doctor directory record in Firestore
      await saveDoctorToFirestore(newDoctor);

      // 2. If Auth account created, register user record with role === 'doctor'
      if (authUid) {
        await saveUserProfile({
          uid: authUid,
          displayName: newDoctor.name,
          email: email.trim(),
          phone: phone.trim(),
          role: 'doctor',
          doctorId: newDoctor.id,
          specialization: newDoctor.specialty,
          status: 'active',
          createdAt: new Date().toISOString(),
        });
      }

      onDoctorAdded(newDoctor);
      setSuccessInfo({ doctorName: newDoctor.name, email: email.trim() });
    } catch (err: any) {
      console.error('Error creating doctor record:', err);
      setError(err?.message || 'Failed to create doctor account. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setTempPassword('');
    setPhone('');
    setError(null);
    setSuccessInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={handleReset}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-['Outfit'] tracking-tight">
                Add Doctor Account & Profile
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Register a hospital doctor in the directory and provision their Doctor Portal access
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {successInfo ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Doctor Successfully Registered</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                <strong className="text-slate-900">{successInfo.doctorName}</strong> has been added to the hospital directory.
                {successInfo.email && (
                  <span>
                    {' '}Doctor can now sign into the <strong>Doctor Portal</strong> using email{' '}
                    <code className="text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded font-mono">{successInfo.email}</code>.
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Close & Return to Doctor Management
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Grid: Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Consultant – Cardiology"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Department & Specialty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Clinical Department *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-800 bg-white"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    Specialty / Focus Field
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Interventional Cardiology"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Qualification & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qualifications & Degrees
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MBBS, MD, DM (Cardiology)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* OPD Room & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    OPD Room / Chamber Location
                  </label>
                  <input
                    type="text"
                    value={roomLocation}
                    onChange={(e) => setRoomLocation(e.target.value)}
                    placeholder="e.g. Room 204, OPD Block B"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    OPD Consultation Hours
                  </label>
                  <input
                    type="text"
                    value={availabilityText}
                    onChange={(e) => setAvailabilityText(e.target.value)}
                    placeholder="Mon - Sat, 9:00 AM - 4:00 PM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bookable Consultation Slots (Comma-separated)
                </label>
                <input
                  type="text"
                  value={timeSlotsInput}
                  onChange={(e) => setTimeSlotsInput(e.target.value)}
                  placeholder="09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium text-slate-900"
                />
              </div>

              {/* Doctor Portal Account Provisioning Section */}
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-bold text-slate-900">
                      Provision Doctor Portal Login Account
                    </span>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-teal-800">
                    <input
                      type="checkbox"
                      checked={createAuthAccount}
                      onChange={(e) => setCreateAuthAccount(e.target.checked)}
                      className="rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Enable Portal Login</span>
                  </label>
                </div>

                {createAuthAccount && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        Doctor Login Email *
                      </label>
                      <input
                        type="email"
                        required={createAuthAccount}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor.name@myhospital.org"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-slate-400" />
                        Initial Temporary Password *
                      </label>
                      <input
                        type="text"
                        required={createAuthAccount}
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        placeholder="Min 6 characters (e.g. Doc@2026)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-mono font-medium text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        Official Contact Mobile (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-medium text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-sm shadow-teal-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? (
                    <span>Registering Doctor...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Save Doctor & Provision Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
