import React from 'react';
import { Department, Doctor, Page, Testimonial } from '../types';
import { DepartmentCard } from '../components/DepartmentCard';
import { DoctorCard } from '../components/DoctorCard';
import { DynamicIcon } from '../components/DynamicIcon';
import { HOSPITAL_STATS, TESTIMONIALS } from '../data/hospitalData';
import {
  Calendar,
  Search,
  ShieldCheck,
  Award,
  Clock,
  HeartPulse,
  Activity,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Users,
  Stethoscope,
  Sparkles,
  Bed,
  Microscope,
  Building2,
  Star,
  GraduationCap
} from 'lucide-react';

interface HomePageProps {
  departments: Department[];
  doctors: Doctor[];
  onNavigate: (page: Page) => void;
  onOpenBooking: (doctorId?: string, deptId?: string) => void;
  onSelectDepartment: (dept: Department) => void;
  onViewDoctorProfile: (doctor: Doctor) => void;
  onOpenEmergency: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  departments,
  doctors,
  onNavigate,
  onOpenBooking,
  onSelectDepartment,
  onViewDoctorProfile,
  onOpenEmergency,
}) => {
  // Show 4 featured departments and 4 featured doctors
  const featuredDepartments = departments.slice(0, 4);
  const featuredDoctors = doctors.slice(0, 4);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>M. Y. Hospital • Government Teaching Hospital</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-['Outfit'] leading-[1.15]">
                Trusted Healthcare, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-100">
                  Teaching & Service <br className="hidden sm:inline" />For Every Life.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Welcome to Maharaja Yeshwantrao Hospital, a major government teaching hospital in Indore. Providing comprehensive healthcare alongside medical education and clinical training, M. Y. Hospital remains committed to accessible, patient-centered care for the community.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  id="hero-book-apt-btn"
                  onClick={() => onOpenBooking()}
                  className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-find-doctor-btn"
                  onClick={() => onNavigate('departments')}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4 text-teal-300" />
                  <span>Explore Departments</span>
                </button>

                <button
                  id="hero-emergency-btn"
                  onClick={onOpenEmergency}
                  className="px-4 py-3.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                  <span>Emergency Services</span>
                </button>
              </div>

              {/* Key Trust Pillars */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-700/60 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>OPD Registrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Multiple Specialties</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>24/7 Emergency Care</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-800/80 p-2">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"
                  alt="M. Y. Hospital Facility"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                />

                {/* Floating Overlay Badge: Hospital Verification */}
                <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">M. Y. Hospital</p>
                    <p className="text-[10px] text-teal-300">Indore&apos;s Government Teaching Hospital</p>
                  </div>
                </div>

                {/* Floating Overlay Badge: Departments availability */}
                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md text-slate-900 rounded-xl p-3.5 shadow-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold">Comprehensive Healthcare</p>
                    <p className="text-[10px] text-slate-600">Multiple Clinical Departments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Action Grid */}
      <section className="-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            id="quick-card-booking"
            onClick={() => onOpenBooking()}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-lg hover:shadow-xl hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Book Now →
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-900">Book OPD Appointment</h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose a department, select an available OPD service, and schedule your hospital visit.
              </p>
            </div>
          </div>

          <div
            id="quick-card-doctors"
            onClick={() => onNavigate('doctors')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-lg hover:shadow-xl hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Directory →
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-900">Find a Specialist</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore doctors and healthcare professionals by medical department.
              </p>
            </div>
          </div>

          <div
            id="quick-card-departments"
            onClick={() => onNavigate('departments')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-lg hover:shadow-xl hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                View All →
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-900">Clinical Departments</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore General Medicine, Surgery, Orthopaedics, Paediatrics, and other clinical services.
              </p>
            </div>
          </div>

          <div
            id="quick-card-emergency"
            onClick={onOpenEmergency}
            className="p-5 rounded-2xl bg-red-50 border border-red-200 shadow-lg hover:shadow-xl hover:border-red-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center">
                <HeartPulse className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-red-600">Emergency Care</span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-red-950">Emergency Services</h3>
              <p className="text-xs text-red-700/90 mt-1">
                For urgent medical situations, contact the hospital emergency services or visit the emergency department.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Stats Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {HOSPITAL_STATS.map((stat, i) => (
              <div key={i} className={`flex flex-col items-center text-center ${i > 0 ? 'pt-6 sm:pt-0 sm:pl-6' : ''}`}>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <DynamicIcon name={stat.iconName} className="w-6 h-6" />
                </div>
                <span className={`${stat.value.length > 10 ? 'text-xl sm:text-2xl lg:text-2xl' : 'text-3xl sm:text-4xl'} font-extrabold text-slate-900 font-['Outfit'] leading-tight`}>
                  {stat.value}
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1">{stat.label}</span>
                <span className="text-[11px] text-slate-500 mt-0.5">{stat.subtext}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Clinical Departments Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span>Specialized Centers of Excellence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              Featured Clinical Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Explore the major clinical departments and healthcare services available at Maharaja Yeshwantrao Hospital, Indore.
            </p>
          </div>

          <button
            id="view-all-departments-top-btn"
            onClick={() => onNavigate('departments')}
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <span>View All Departments →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDepartments.map((dept) => {
            const deptDocs = doctors.filter((d) => d.departmentId === dept.id);
            return (
              <DepartmentCard
                key={dept.id}
                department={dept}
                doctors={deptDocs}
                onSelectDepartment={onSelectDepartment}
                onBookDepartment={(d) => onOpenBooking(undefined, d.id)}
              />
            );
          })}
        </div>
      </section>

      {/* Featured Doctors Section (Multiple doctors per department highlighted) */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>OUR SPECIALIST DOCTORS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
                Meet M. Y. Hospital’s Specialist Doctors
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Our medical departments bring together dedicated doctors and healthcare professionals providing specialized care across a wide range of medical disciplines.
              </p>
            </div>

            <button
              id="view-all-doctors-top-btn"
              onClick={() => onNavigate('doctors')}
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <span>Explore All Doctors →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onBook={(d) => onOpenBooking(d.id, d.departmentId)}
                onViewProfile={onViewDoctorProfile}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose M. Y. Hospital */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                THE M. Y. HOSPITAL STANDARD
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit'] leading-tight">
                Why Patients Trust M. Y. Hospital
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Maharaja Yeshwantrao Hospital serves the people of Indore and the surrounding region with comprehensive healthcare, specialist services, medical education, and dedicated patient care.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Government Healthcare & Accessibility</h4>
                    <p className="text-xs text-slate-300">
                      Comprehensive medical services focused on accessible healthcare for the community.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Multispecialty Medical Care</h4>
                    <p className="text-xs text-slate-300">
                      A wide range of clinical departments supporting diagnosis, treatment, emergency care, and specialist services.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Teaching & Clinical Excellence</h4>
                    <p className="text-xs text-slate-300">
                      A major teaching hospital supporting medical education, clinical training, and healthcare services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  id="why-choose-explore-btn"
                  onClick={() => onNavigate('departments')}
                  className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Hospital Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"
                    alt="Emergency & Trauma Care"
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-3 bg-slate-900/90 text-xs">
                    <p className="font-bold text-white">Emergency & Trauma Care</p>
                    <p className="text-[10px] text-slate-400">Emergency medical services for patients requiring urgent care.</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
                    alt="Patient Care Services"
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-3 bg-slate-900/90 text-xs">
                    <p className="font-bold text-white">Patient Care Services</p>
                    <p className="text-[10px] text-slate-400">Dedicated services supporting patients throughout their hospital journey.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
                    alt="Medical Departments"
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-3 bg-slate-900/90 text-xs">
                    <p className="font-bold text-white">Medical Departments</p>
                    <p className="text-[10px] text-slate-400">Comprehensive care across multiple clinical specialties.</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
                    alt="Teaching & Medical Education"
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-3 bg-slate-900/90 text-xs">
                    <p className="font-bold text-white">Teaching & Medical Education</p>
                    <p className="text-[10px] text-slate-400">Supporting medical education and clinical training.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Patient Experiences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
            Stories of Care & Recovery
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Every patient's journey is unique. Our dedicated healthcare teams strive to provide compassionate and patient-centered care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.patientName}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.patientName}</h4>
                  <p className="text-[11px] text-teal-700 font-medium">{item.treatment}</p>
                  <p className="text-[10px] text-slate-400">{item.secondaryText || 'Patient Experience'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-teal-700 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-['Outfit']">
              Ready to Consult with a Specialist?
            </h3>
            <p className="text-xs sm:text-sm text-teal-100">
              Select any department, pick from multiple expert physicians, and secure your OPD slot immediately.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="cta-banner-book-btn"
              onClick={() => onOpenBooking()}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-teal-900 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Now</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
