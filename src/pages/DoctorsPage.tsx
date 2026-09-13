import React, { useState, useMemo } from 'react';
import { Department, Doctor, Page } from '../types';
import { DoctorCard } from '../components/DoctorCard';
import {
  Search,
  Filter,
  Stethoscope,
  Calendar,
  Star,
  Award,
  Users,
  Building2,
  CheckCircle2,
  Globe
} from 'lucide-react';

interface DoctorsPageProps {
  doctors: Doctor[];
  departments: Department[];
  onBookDoctor: (doctor: Doctor) => void;
  onViewDoctorProfile: (doctor: Doctor) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  departments,
  onBookDoctor,
  onViewDoctorProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        doc.name.toLowerCase().includes(query) ||
        doc.specialty.toLowerCase().includes(query) ||
        doc.departmentName.toLowerCase().includes(query) ||
        doc.title.toLowerCase().includes(query) ||
        doc.degrees.some((d) => d.toLowerCase().includes(query));

      const matchesDept = selectedDeptId === 'all' || doc.departmentId === selectedDeptId;
      const matchesDay = selectedDay === 'all' || doc.availabilityDays.includes(selectedDay);

      return matchesSearch && matchesDept && matchesDay;
    });
  }, [doctors, searchQuery, selectedDeptId, selectedDay]);

  // Group count of doctors per department
  const doctorCountByDept = useMemo(() => {
    const map: Record<string, number> = {};
    doctors.forEach((d) => {
      map[d.departmentId] = (map[d.departmentId] || 0) + 1;
    });
    return map;
  }, [doctors]);

  return (
    <div className="space-y-12 pb-16">
      {/* Top Header Banner */}
      <section className="bg-slate-900 text-white py-14 sm:py-18 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Medical Faculty & Specialists</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] tracking-tight">
              Our Specialist Doctors
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every department at M. Y. Hospital is staffed by multiple board-certified consultants, surgeons, and physicians ready to care for you.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Search Bar & Day Filter */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              id="doctor-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, qualification..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Availability day filter pills */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Day:</span>
            </span>
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedDay === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Any Day
            </button>
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedDay === day
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Department Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            id="doc-filter-dept-all"
            onClick={() => setSelectedDeptId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedDeptId === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>All Departments</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedDeptId === 'all' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {doctors.length}
            </span>
          </button>

          {departments.map((dept) => {
            const count = doctorCountByDept[dept.id] || 0;
            const isSelected = selectedDeptId === dept.id;
            return (
              <button
                key={dept.id}
                id={`doc-filter-dept-${dept.id}`}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{dept.name.split('&')[0]}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredDoctors.length}</strong> verified doctors
          </p>

          <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            ✓ Multiple Specialists Per Department Available
          </span>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No doctors match your criteria</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query, clearing the day filter, or selecting "All Departments".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDeptId('all');
                setSelectedDay('all');
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onBook={onBookDoctor}
                onViewProfile={onViewDoctorProfile}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
