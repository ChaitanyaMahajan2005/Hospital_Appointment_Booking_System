import React from 'react';
import { Doctor } from '../types';
import {
  X,
  Star,
  Award,
  Clock,
  MapPin,
  Globe,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBook: (doctor: Doctor) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  onClose,
  onBook,
}) => {
  if (!doctor) return null;

  return (
    <div
      id="doctor-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="doctor-detail-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-6 relative">
          <button
            id="close-doctor-detail-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
            />
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-300/30 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {doctor.departmentName}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit']">{doctor.name}</h2>
              <p className="text-xs sm:text-sm text-teal-100/90 font-medium mt-0.5">
                {doctor.title}
              </p>

              <div className="flex items-center gap-4 mt-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-teal-200 font-medium">
                  <Award className="w-3.5 h-3.5 text-teal-300" />
                  <span>{doctor.experienceBadge || (doctor.experienceYears ? `${doctor.experienceYears} Years Practice` : 'Experienced')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Clinical Background & Specialization
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{doctor.bio}</p>
          </div>

          {/* Degrees & Fellowships */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>Qualifications & Degrees</span>
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {doctor.degrees.map((deg, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{deg}</span>
                  </li>
                ))}
              </ul>
            </div>

            {doctor.fellowships && doctor.fellowships.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Fellowships & Accreditations</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {doctor.fellowships.map((fel, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{fel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Schedule & Logistics */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Consultation Location
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{doctor.roomLocation}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Consultation Days
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{doctor.availabilityDays.join(', ')}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Languages
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{doctor.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Typical time slots */}
            <div className="pt-2 border-t border-slate-200 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                Standard Consultation Slots
              </span>
              <div className="flex flex-wrap gap-2">
                {doctor.timeSlots.map((ts, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3 text-teal-600" />
                    {ts}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              CONSULTATION
            </span>
            <span className="text-base font-bold text-slate-900">Hospital Service</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="close-profile-bottom-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              id="book-doctor-profile-btn"
              onClick={() => {
                onClose();
                onBook(doctor);
              }}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment with Dr. {doctor.name.split(' ').pop()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
