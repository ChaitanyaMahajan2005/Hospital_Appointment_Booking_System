import React, { useState, useMemo } from 'react';
import { Department, Doctor, Page } from '../types';
import { DepartmentCard } from '../components/DepartmentCard';
import {
  Search,
  Building2,
  Calendar,
  Filter,
  HeartPulse,
  Sparkles,
  Users,
  ShieldCheck,
  Stethoscope,
  Bed,
  CheckCircle2
} from 'lucide-react';

interface DepartmentsPageProps {
  departments: Department[];
  doctors: Doctor[];
  onSelectDepartment: (dept: Department) => void;
  onBookDepartment: (dept: Department) => void;
  onNavigateToDoctors: () => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  departments,
  doctors,
  onSelectDepartment,
  onBookDepartment,
  onNavigateToDoctors,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Specialties' },
    { id: 'surgical', label: 'Surgical & Interventions' },
    { id: 'acute', label: 'Acute & Emergency' },
    { id: 'lifestyle', label: 'Medicine & Lifestyle' },
  ];

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.procedures.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesCategory = true;
      if (selectedCategory === 'surgical') {
        matchesCategory = ['cardiology', 'neurology', 'orthopedics', 'oncology'].includes(dept.id);
      } else if (selectedCategory === 'acute') {
        matchesCategory = ['emergency', 'pediatrics', 'cardiology'].includes(dept.id);
      } else if (selectedCategory === 'lifestyle') {
        matchesCategory = ['general-medicine', 'dermatology'].includes(dept.id);
      }

      return matchesSearch && matchesCategory;
    });
  }, [departments, searchQuery, selectedCategory]);

  return (
    <div className="space-y-12 pb-16">
      {/* Top Banner */}
      <section className="bg-slate-900 text-white py-14 sm:py-18 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Specialized Clinical Institutes</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] tracking-tight">
              Clinical Departments at M. Y. Hospital
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every department at M. Y. Hospital is an independent center of clinical excellence equipped with dedicated ICUs, modular OTs, and multiple consultant doctors.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              id="department-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search department, procedure, treatment..."
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

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`dept-cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Department Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredDepartments.length}</strong> of{' '}
            {departments.length} departments
          </p>

          <button
            onClick={onNavigateToDoctors}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Search directly by Doctor ({doctors.length} available) →</span>
          </button>
        </div>

        {filteredDepartments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No departments match your search</h3>
            <p className="text-xs text-slate-500">
              Try searching with a different keyword like "heart", "spine", "skin", or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => {
              const deptDocs = doctors.filter((d) => d.departmentId === dept.id);
              return (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  doctors={deptDocs}
                  onSelectDepartment={onSelectDepartment}
                  onBookDepartment={onBookDepartment}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Information Banner: Multiple Doctors per Department Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-teal-950">
                Multiple Consultant Specialists In Every Department
              </h3>
              <p className="text-xs text-teal-800/80 mt-0.5 max-w-xl">
                Need a second opinion or immediate appointment? Every medical institute at M. Y. Hospital has multiple senior consultants covering morning and evening OPD shifts.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToDoctors}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Browse All Specialists
          </button>
        </div>
      </section>
    </div>
  );
};
