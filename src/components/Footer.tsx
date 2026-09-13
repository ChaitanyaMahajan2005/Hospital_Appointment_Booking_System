import React, { useState } from 'react';
import { Page } from '../types';
import {
  HeartPulse,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ArrowRight,
  CheckCircle,
  Ambulance,
  Building2
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: Page) => void;
  onOpenBooking: (preselectedDoctorId?: string, preselectedDepartmentId?: string) => void;
  onOpenEmergency: () => void;
}

const DEPARTMENTS_LIST = [
  'General Medicine',
  'General Surgery',
  'Orthopaedics',
  'Paediatrics',
  'Obstetrics & Gynaecology'
];

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenEmergency,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Emergency CTA Card in Footer */}
        <div className="bg-gradient-to-r from-teal-900/80 via-slate-800 to-teal-950 border border-teal-500/30 rounded-2xl p-6 sm:p-8 mb-14 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <Ambulance className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  EMERGENCY & CRITICAL CARE
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Need Emergency Medical Care?
              </h3>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                For urgent medical situations, contact the hospital emergency services or visit the emergency department.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              id="footer-emergency-call-btn"
              onClick={onOpenEmergency}
              className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ambulance className="w-4 h-4" />
              <span>Emergency Services</span>
            </button>
            <button
              id="footer-book-now-cta"
              onClick={() => onOpenBooking()}
              className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Key Features */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-['Outfit'] block">
                  M. Y. HOSPITAL
                </span>
                <span className="text-[10px] font-semibold text-teal-400 tracking-wider block">
                  MAHARAJA YESHWANTRAO HOSPITAL • INDORE
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              Maharaja Yeshwantrao Hospital is a major government teaching hospital in Indore, providing comprehensive healthcare services while supporting medical education and clinical training.
            </p>

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Government Teaching Hospital</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Comprehensive Medical Services</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Emergency & Patient Care Services</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4 font-['Outfit']">
              EXPLORE
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  id="footer-link-home"
                  onClick={() => onNavigate('home')}
                  className="hover:text-teal-400 transition-colors text-slate-400 hover:underline cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  id="footer-link-about"
                  onClick={() => onNavigate('about')}
                  className="hover:text-teal-400 transition-colors text-slate-400 hover:underline cursor-pointer"
                >
                  About M. Y. Hospital
                </button>
              </li>
              <li>
                <button
                  id="footer-link-departments"
                  onClick={() => onNavigate('departments')}
                  className="hover:text-teal-400 transition-colors text-slate-400 hover:underline cursor-pointer"
                >
                  Medical Departments
                </button>
              </li>
              <li>
                <button
                  id="footer-link-doctors"
                  onClick={() => onNavigate('doctors')}
                  className="hover:text-teal-400 transition-colors text-slate-400 hover:underline cursor-pointer"
                >
                  Our Doctors
                </button>
              </li>
              <li>
                <button
                  id="footer-link-services"
                  onClick={() => onNavigate('departments')}
                  className="hover:text-teal-400 transition-colors text-slate-400 hover:underline cursor-pointer"
                >
                  Hospital Services
                </button>
              </li>
              <li>
                <button
                  id="footer-link-booking"
                  onClick={() => onOpenBooking()}
                  className="hover:text-teal-400 transition-colors text-teal-400 font-medium hover:underline cursor-pointer"
                >
                  Book an Appointment
                </button>
              </li>
              <li>
                <button
                  id="footer-link-contact"
                  onClick={() => onNavigate('about')}
                  className="hover:text-teal-400 transition-colors text-slate-400 hover:underline cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Departments */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4 font-['Outfit']">
              DEPARTMENTS
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {DEPARTMENTS_LIST.map((deptName) => (
                <li key={deptName}>
                  <button
                    id={`footer-dept-${deptName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => {
                      onNavigate('departments');
                    }}
                    className="hover:text-teal-400 transition-colors text-left truncate max-w-[190px] block cursor-pointer"
                  >
                    {deptName}
                  </button>
                </li>
              ))}
              <li>
                <button
                  id="footer-dept-all"
                  onClick={() => onNavigate('departments')}
                  className="text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer pt-1 block"
                >
                  View All Departments →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4 font-['Outfit']">
              HOSPITAL CONTACT
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">Maharaja Yeshwantrao Hospital</span>
                  <span className="block text-slate-400">Indore, Madhya Pradesh, India</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Hospital Enquiry</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="text-xs font-semibold text-white mb-2">
                Hospital Updates
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    id="footer-newsletter-input"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="w-full px-3 py-2 text-xs rounded-l-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:outline-hidden focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    id="footer-newsletter-submit"
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-r-lg transition-colors cursor-pointer"
                  >
                    Subscribe
                  </button>
                </div>
                {subscribed && (
                  <p className="text-xs text-teal-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Subscribed! Thank you.</span>
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Maharaja Yeshwantrao Hospital, Indore. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Patient Information</span>
            <span
              onClick={() => onNavigate('about')}
              className="hover:text-slate-400 transition-colors cursor-pointer"
            >
              Contact Us
            </span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Medical Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
