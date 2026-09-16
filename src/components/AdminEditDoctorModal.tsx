import React, { useState, useEffect } from 'react';
import { Department, Doctor } from '../types';
import {
  X,
  Save,
  User,
  Mail,
  Phone,
  Stethoscope,
  Building2,
  Award,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { updateDoctorProfileInFirestore, saveDoctorToFirestore } from '../lib/firebase';

interface AdminEditDoctorModalProps {
  isOpen: boolean;
  doctor: Doctor | null;
  departments: Department[];
  onClose: () => void;
  onDoctorUpdated: (doctor: Doctor) => void;
}

export const AdminEditDoctorModal: React.FC<AdminEditDoctorModalProps> = ({
  isOpen,
  doctor,
  departments,
  onClose,
  onDoctorUpdated,
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roomLocation, setRoomLocation] = useState('');
  const [bio, setBio] = useState('');
  const [availabilityText, setAvailabilityText] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (doctor) {
      setName(doctor.name || '');
      setTitle(doctor.title || 'Senior Consultant');
      setDepartmentId(doctor.departmentId || departments[0]?.id || '');
      setSpecialty(doctor.specialty || '');
      setQualification(doctor.qualification || doctor.degrees?.join(', ') || 'MBBS, MD');
      setExperienceYears(String(doctor.experienceYears || 5));
      setEmail(doctor.email || '');
      setPhone(doctor.phone || '');
      setRoomLocation(doctor.roomLocation || '');
      setBio(doctor.bio || '');
      setAvailabilityText(doctor.availabilityText || 'Mon - Sat, 9:00 AM - 4:00 PM');
      setStatus(doctor.status === 'inactive' ? 'inactive' : 'active');
      setError(null);
    }
  }, [doctor, departments]);

  if (!isOpen || !doctor) return null;

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
      setError('Doctor name is required.');
      return;
    }

    setLoading(true);

    try {
      const selectedDept = departments.find((d) => d.id === departmentId);
      const updatedDoctor: Doctor = {
        ...doctor,
        name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
        title: title.trim() || 'Senior Consultant',
        departmentId: departmentId || doctor.departmentId,
        departmentName: selectedDept?.name || specialty || doctor.departmentName,
        specialty: specialty.trim() || selectedDept?.name || doctor.specialty,
        experienceYears: Number(experienceYears) || doctor.experienceYears || 5,
        qualification: qualification.trim() || doctor.qualification,
        email: email.trim() || doctor.email,
        phone: phone.trim() || doctor.phone,
        roomLocation: roomLocation.trim() || doctor.roomLocation,
        bio: bio.trim() || doctor.bio,
        availabilityText: availabilityText.trim() || doctor.availabilityText,
        status,
      };

      await updateDoctorProfileInFirestore(doctor.id, updatedDoctor);
      await saveDoctorToFirestore(updatedDoctor);

      onDoctorUpdated(updatedDoctor);
      onClose();
    } catch (err: any) {
      console.error('Error updating doctor profile:', err);
      setError(err?.message || 'Failed to update doctor profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Outfit']">Edit Doctor Profile</h3>
              <p className="text-xs text-slate-400">
                Updating credentials for <span className="text-teal-300 font-semibold">{doctor.name}</span> (ID: {doctor.id})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Doctor Account Status</span>
              <span className="text-[11px] text-slate-500">
                {status === 'active' ? 'Active — accepting patient appointments' : 'Inactive — paused from bookings'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                status === 'active'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
              }`}
            >
              {status === 'active' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Inactive</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title / Designation</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Department</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={departmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications</label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">OPD Chamber / Room</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Availability Schedule</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={availabilityText}
                  onChange={(e) => setAvailabilityText(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Biography / Overview</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Updates'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
