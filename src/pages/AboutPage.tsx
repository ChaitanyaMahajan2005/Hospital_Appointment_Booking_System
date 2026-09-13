import React from 'react';
import { Page } from '../types';
import {
  ShieldCheck,
  Award,
  Clock,
  HeartPulse,
  Users,
  Building2,
  CheckCircle2,
  Stethoscope,
  Microscope,
  Calendar,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone
} from 'lucide-react';
import { HOSPITAL_STATS } from '../data/hospitalData';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
  onOpenBooking: () => void;
  onOpenEmergency: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenEmergency,
}) => {
  const leadership = [
    {
      name: 'Dr. Rajesh Sharma, MD',
      role: 'Chief Medical Officer & Clinical Director',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      bio: 'Experienced in patient care, clinical coordination, and hospital services.',
    },
    {
      name: 'Dr. Anjali Verma, MS',
      role: 'Senior Consultant – General Surgery',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
      bio: 'Focused on surgical care, patient safety, and evidence-based treatment.',
    },
    {
      name: 'Dr. Amit Patel, MS',
      role: 'Senior Consultant – Orthopaedics',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
      bio: 'Specialized in orthopaedic care, trauma management, and rehabilitation.',
    },
    {
      name: 'Dr. Priya Singh, MD',
      role: 'Senior Consultant – Internal Medicine',
      photo: 'https://images.unsplash.com/photo-1594824813579-456073b648ff?auto=format&fit=crop&w=400&q=80',
      bio: 'Dedicated to comprehensive medical care, diagnosis, and patient well-being.',
    },
  ];

  const milestones = [
    {
      year: '1937',
      title: 'Vision for a Major Hospital',
      desc: 'The vision for a large modern hospital in Indore was conceived during the period of Maharaja Yeshwantrao Holkar. The project was later delayed because of World War II.',
    },
    {
      year: '1948',
      title: 'Construction Begins',
      desc: 'Construction of the major hospital project began in the post-war period, laying the foundation for what would become one of the landmark government hospitals in Central India.',
    },
    {
      year: '1955',
      title: 'Maharaja Yeshwantrao Hospital Inaugurated',
      desc: 'Maharaja Yeshwantrao Hospital was inaugurated in 1955. It became the major teaching hospital associated with Mahatma Gandhi Memorial Medical College, Indore.',
    },
    {
      year: '2002',
      title: 'The Indore Experiment',
      desc: "A Patient Welfare Society, known as Rogi Kalyan Samiti, was introduced at MY Hospital as part of the 'Indore Experiment' to improve hospital management and healthcare delivery. The approach later became a model adopted by many government hospitals.",
    },
    {
      year: '2025',
      title: 'Major Redevelopment & Expansion',
      desc: 'The Government of Madhya Pradesh approved a major redevelopment and expansion plan for MY Hospital, including a new large-capacity hospital building while continuing services in the existing hospital.',
    },
    {
      year: '2026',
      title: 'Continuing as a Major Tertiary Teaching Hospital',
      desc: 'Today, MY Hospital continues to serve as a major government teaching hospital in Indore, working alongside Mahatma Gandhi Memorial Medical College and its associated hospitals to provide advanced healthcare, medical education and training.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Top Header Banner */}
      <section className="bg-slate-900 text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>About M. Y. Hospital</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] tracking-tight">
              70+ Years of Healing, Service & Medical Excellence
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Maharaja Yeshwantrao Hospital (M.Y. Hospital), Indore, is one of the region’s prominent government teaching hospitals, providing comprehensive healthcare while supporting medical education and clinical training. With a wide range of clinical specialties and dedicated healthcare professionals, the hospital continues its commitment to accessible, patient-centered care and service to the community.
            </p>
          </div>
        </div>
      </section>

      {/* Hospital Identity & Mission/Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Our Institutional Philosophy
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
                Redefining the Patient Experience with Empathy & High Tech
              </h2>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              At M. Y. Hospital, we recognize that true healthcare extends far beyond diagnoses and procedures. It requires listening, clear communication, and an environment where patients and their families feel respected and secure.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Our Mission</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To provide accessible, highest-quality specialized healthcare through continuous medical innovation and ethical clinical practices.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Our Vision</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To be the region's benchmark health institution where clinical excellence, academic research, and warm humanity unite seamlessly.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Multiple experienced senior doctors dedicated to every medical wing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Zero-delay emergency triage with round-the-clock cardiac trauma readiness</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Transparent billing, digital tokens, and instant appointment booking</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80"
                alt="M. Y. Hospital Medical Team"
                referrerPolicy="no-referrer"
                className="w-full h-96 object-cover"
              />
              <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">M. Y. Hospital Campus</h4>
                  <p className="text-xs text-slate-500">M. Y. Hospital Campus, Healthcare Road, Indore</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                  400+ Beds Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Metrics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {HOSPITAL_STATS.map((item, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-4 md:pt-0 md:pl-6' : ''}>
                <span className={`${item.value.length > 10 ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-3xl sm:text-4xl'} font-black font-['Outfit'] text-teal-300 block leading-tight`}>
                  {item.value}
                </span>
                <span className="text-xs font-bold text-white mt-1 block">{item.label}</span>
                <span className="text-[11px] text-slate-400">{item.subtext}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Milestones */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            History & Legacy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            Milestones of Maharaja Yeshwantrao Hospital
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            The heritage and evolutionary milestones of MY Hospital, Indore — serving as Central India’s landmark government teaching institution.
          </p>
        </div>

        <div className="relative border-l-2 border-teal-200 ml-4 sm:ml-8 md:ml-28 lg:ml-36 space-y-8 pl-6 sm:pl-8">
          {milestones.map((m, i) => (
            <div key={i} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-2 w-5 h-5 rounded-full bg-white border-4 border-teal-600 group-hover:border-teal-700 group-hover:scale-110 shadow-xs transition-transform duration-200"></div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 hover:shadow-md transition-all duration-200">
                <span className="text-xs font-black text-teal-700 uppercase tracking-wider block">
                  {m.year}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] mt-1 leading-snug">
                  {m.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Medical Leadership */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Leadership & Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            Clinical Leadership Team
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Dedicated healthcare professionals committed to patient care, medical education, and clinical excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((leader, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all text-center p-5"
            >
              <img
                src={leader.photo}
                alt={leader.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-teal-100 shadow-sm mb-3"
              />
              <h3 className="text-sm font-bold text-slate-900">{leader.name}</h3>
              <p className="text-xs font-semibold text-teal-700 mt-0.5">{leader.role}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{leader.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hospital Features & Care Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Government Teaching Hospital</h4>
              <p className="text-xs text-slate-600">
                Maharaja Yeshwantrao Hospital is a major government teaching hospital serving patients in Indore and the surrounding region.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Microscope className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Comprehensive Medical Services</h4>
              <p className="text-xs text-slate-600">
                Provides a broad range of clinical and diagnostic healthcare services through its various hospital departments.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Emergency & Patient Care</h4>
              <p className="text-xs text-slate-600">
                Supporting patients with emergency care and essential hospital services as part of comprehensive healthcare delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 font-['Outfit']">
          Experience M. Y. Hospital Care Firsthand
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Explore our medical departments, learn about hospital services, and find information to help you access care at M. Y. Hospital.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="about-explore-depts-btn"
            onClick={() => onNavigate('departments')}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Explore Departments
          </button>
          <button
            id="about-explore-docs-btn"
            onClick={() => onNavigate('doctors')}
            className="px-5 py-2.5 rounded-xl border border-teal-300 hover:bg-teal-50 text-teal-800 text-xs font-bold transition-colors cursor-pointer"
          >
            View Doctors
          </button>
          <button
            id="about-book-now-btn"
            onClick={onOpenBooking}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </section>
    </div>
  );
};
