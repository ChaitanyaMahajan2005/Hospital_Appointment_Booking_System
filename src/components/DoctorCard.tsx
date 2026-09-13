import React from 'react';
import { Doctor } from '../types';
import {
  Clock,
  MapPin,
  Calendar,
  Award,
  Globe
} from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
  onViewProfile: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onBook,
  onViewProfile,
}) => {
  return (
    <div
      id={`doctor-card-${doctor.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-teal-200 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
    >
      <div>
        {/* Top Header with Image & Department Tag */}
        <div className="relative p-5 pb-0 flex gap-4">
          <div className="relative shrink-0">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-100 shadow-sm group-hover:scale-102 transition-transform duration-200"
            />
            <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center gap-0.5 shadow-xs">
              <Award className="w-3 h-3" />
              <span>{doctor.experienceBadge || 'Experienced'}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold text-xs border border-teal-200/60 truncate">
                {doctor.departmentName ? doctor.departmentName.split('&')[0].trim() : doctor.specialty}
              </span>
            </div>

            <h3
              onClick={() => onViewProfile(doctor)}
              className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer truncate"
            >
              {doctor.name}
            </h3>

            <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-0.5">
              {doctor.title}
            </p>

            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {doctor.qualification || doctor.degrees?.join(' • ')}
            </p>
          </div>
        </div>

        {/* Doctor details body */}
        <div className="p-5 pt-4 space-y-3">
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {doctor.bio}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{doctor.roomLocation || 'M. Y. Hospital, Indore'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-700 font-medium">Availability:</span>
              <span className="text-slate-500">
                {doctor.availabilityText || 'OPD Schedule'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500">
                Speaks {doctor.languages?.join(', ') || 'Hindi, English'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Consultation & Action Buttons */}
      <div className="p-5 pt-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            CONSULTATION
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 block">
            Hospital Service
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id={`btn-profile-${doctor.id}`}
            onClick={() => onViewProfile(doctor)}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Profile
          </button>
          <button
            id={`btn-book-${doctor.id}`}
            onClick={() => onBook(doctor)}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs shadow-teal-600/20 flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
