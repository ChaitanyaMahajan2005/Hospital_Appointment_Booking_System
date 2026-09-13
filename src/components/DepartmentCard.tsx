import React from 'react';
import { Department, Doctor } from '../types';
import { DynamicIcon } from './DynamicIcon';
import {
  Calendar,
  ChevronRight
} from 'lucide-react';

interface DepartmentCardProps {
  department: Department;
  doctors: Doctor[];
  onSelectDepartment: (dept: Department) => void;
  onBookDepartment: (dept: Department) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  doctors: _doctors,
  onSelectDepartment,
  onBookDepartment,
}) => {
  return (
    <div
      id={`department-card-${department.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-teal-200 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
    >
      <div>
        {/* Top Banner Image */}
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={department.image}
            alt={department.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent"></div>

          {/* Floating Icon */}
          <div className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-teal-700">
            <DynamicIcon name={department.iconName} className="w-6 h-6" />
          </div>

          {/* Teal Department Badge */}
          <div className="absolute bottom-3 left-4 flex items-center text-white text-xs">
            <span className="font-semibold px-2.5 py-1 rounded-md bg-teal-600/95 backdrop-blur-xs text-white shadow-xs">
              {department.badge || 'Clinical Department'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3
            onClick={() => onSelectDepartment(department)}
            className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer"
          >
            {department.name}
          </h3>

          <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
            {department.description}
          </p>

          {/* Specialized Services */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Specialized Services
            </p>
            <div className="flex flex-wrap gap-1.5">
              {department.procedures.map((proc, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                >
                  {proc}
                </span>
              ))}
            </div>
          </div>

          {/* Department Information */}
          <div className="mt-3 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{department.headOfDepartment}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          id={`btn-dept-details-${department.id}`}
          onClick={() => onSelectDepartment(department)}
          className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
        >
          <span>View Team & Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          id={`btn-dept-book-${department.id}`}
          onClick={() => onBookDepartment(department)}
          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Appointment</span>
        </button>
      </div>
    </div>
  );
};
