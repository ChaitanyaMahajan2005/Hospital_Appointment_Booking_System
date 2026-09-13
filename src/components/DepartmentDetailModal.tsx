import React from 'react';
import { Department, Doctor } from '../types';
import { DynamicIcon } from './DynamicIcon';
import {
  X,
  Bed,
  CheckCircle2,
  Calendar,
  Star,
  Award,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface DepartmentDetailModalProps {
  department: Department | null;
  doctors: Doctor[];
  onClose: () => void;
  onBookDoctor: (doctor: Doctor) => void;
  onViewDoctorProfile: (doctor: Doctor) => void;
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  department,
  doctors,
  onClose,
  onBookDoctor,
  onViewDoctorProfile,
}) => {
  if (!department) return null;

  return (
    <div
      id="department-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="department-detail-modal-container"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Banner */}
        <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden">
          <img
            src={department.image}
            alt={department.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

          <button
            id="close-department-detail-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-lg bg-teal-500/80 flex items-center justify-center text-white">
                  <DynamicIcon name={department.iconName} className="w-5 h-5" />
                </span>
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                  Specialty Department
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                {department.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
                {department.tagline}
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end text-xs text-slate-300">
              <span className="font-bold text-white text-base">{department.bedCount} Beds</span>
              <span>Inpatient Capacity</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Department Description & Fast stats */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Department Overview
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{department.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Head of Department</span>
                <span className="font-bold text-slate-900">{department.headOfDepartment}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Established</span>
                <span className="font-bold text-slate-900">Year {department.establishedYear}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Inpatient Beds</span>
                <span className="font-bold text-slate-900">{department.bedCount} Modern Beds</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Direct Desk Ext.</span>
                <span className="font-bold text-teal-700">{department.contactExtension}</span>
              </div>
            </div>
          </div>

          {/* Key Procedures & Clinical Facilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Specialized Interventions & Procedures</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {department.procedures.map((proc, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{proc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Bed className="w-4 h-4 text-teal-600" />
                <span>Diagnostic & Surgical Facilities</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {department.facilities.map((fac, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Department Specialist Doctors (Multiple Doctors per department) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Consultant Doctors in {department.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Select a doctor to book your consultation directly
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold text-xs border border-teal-200">
                {doctors.length} Doctors
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  id={`dept-doc-item-${doctor.id}`}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={doctor.photoUrl}
                      alt={doctor.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-sm font-bold text-slate-900 truncate">{doctor.name}</h5>
                      </div>
                      <p className="text-xs text-teal-700 font-medium truncate">{doctor.specialty}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {doctor.experienceBadge || (doctor.experienceYears ? `${doctor.experienceYears}y exp` : 'Experienced')} • Hospital Service
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {doctor.availabilityText || `Days: ${doctor.availabilityDays.slice(0, 3).join(', ')}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <button
                      id={`dept-doc-profile-btn-${doctor.id}`}
                      onClick={() => onViewDoctorProfile(doctor)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      id={`dept-doc-book-btn-${doctor.id}`}
                      onClick={() => onBookDoctor(doctor)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-teal-600" />
            <span>M. Y. Hospital OPD Counter: {department.contactExtension}</span>
          </div>

          <button
            id="dept-detail-close-footer"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
