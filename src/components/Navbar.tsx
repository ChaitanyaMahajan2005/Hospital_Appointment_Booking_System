import React, { useState } from 'react';
import { Page } from '../types';
import {
  PhoneCall,
  Calendar,
  Clock,
  MapPin,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  HeartPulse,
  UserCheck,
  Building2,
  Ambulance,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onOpenBooking: (preselectedDoctorId?: string, preselectedDepartmentId?: string) => void;
  onOpenAppointments: () => void;
  onOpenEmergency: () => void;
  appointmentsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenBooking,
  onOpenAppointments,
  onOpenEmergency,
  appointmentsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { currentUser, userProfile, isAdmin, isDoctor, logout, openAuthModal } = useAuth();

  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Building2 className="w-4 h-4" /> },
    { id: 'about', label: 'About Us', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'departments', label: 'Departments', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'doctors', label: 'Our Doctors', icon: <Stethoscope className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Patient';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>M. Y. Hospital Campus, Healthcare Road</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>OPD: Mon–Sat 8:00 AM – 8:00 PM | Emergency 24/7</span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              id="top-emergency-btn"
              onClick={onOpenEmergency}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/90 hover:bg-red-500 text-white font-medium transition-colors cursor-pointer"
            >
              <Ambulance className="w-3.5 h-3.5 animate-pulse" />
              <span>Emergency 24/7: 1800-633-477</span>
            </button>
            <div className="hidden sm:inline-block h-3 w-px bg-slate-700"></div>
            <button
              id="top-my-appointments-btn"
              onClick={onOpenAppointments}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>My Appointments</span>
              {appointmentsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-teal-500 text-slate-950 font-bold text-[10px]">
                  {appointmentsCount}
                </span>
              )}
            </button>
            <div className="hidden sm:inline-block h-3 w-px bg-slate-700"></div>
            <button
              id="top-doctor-portal-btn"
              onClick={() => handleNavClick('doctor')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold transition-colors cursor-pointer text-[11px] ${
                currentPage === 'doctor'
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-xs'
                  : isDoctor
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40 hover:bg-teal-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>Doctor Portal</span>
              {isDoctor && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
            <div className="hidden sm:inline-block h-3 w-px bg-slate-700"></div>
            <button
              id="top-admin-portal-btn"
              onClick={() => handleNavClick('admin')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold transition-colors cursor-pointer text-[11px] ${
                currentPage === 'admin'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : isAdmin
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal</span>
              {isAdmin && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Hospital Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform duration-200">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-['Outfit']">
                  M. Y.
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/60 uppercase tracking-wider">
                  HOSPITAL
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium tracking-tight leading-tight mt-0.5">
                Teaching Hospital of MGM Medical College, Indore
              </p>
              <p className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium tracking-tight leading-tight mt-0.5">
                Since 1955 • A Historic Healthcare Landmark
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'text-teal-700 bg-teal-50/80 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action CTA & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              id="header-call-doc-btn"
              onClick={onOpenEmergency}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
              title="24/7 Emergency Line"
            >
              <PhoneCall className="w-4 h-4 text-red-500" />
              <span className="hidden md:inline">Helpline</span>
            </button>

            {/* Auth Button or User Profile Pill */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="px-3 py-2 rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 text-teal-900 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                </button>

                {userDropdownOpen && (
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      {userProfile?.phone && (
                        <p className="text-[10px] text-teal-700 mt-0.5 font-medium">{userProfile.phone}</p>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAppointments();
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>My Appointments</span>
                        {appointmentsCount > 0 && (
                          <span className="ml-auto px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                            {appointmentsCount}
                          </span>
                        )}
                      </button>
                      <button
                        id="user-dropdown-doctor-portal-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavClick('doctor');
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-teal-900 bg-teal-50/70 hover:bg-teal-100/70 rounded-lg flex items-center gap-2 cursor-pointer my-0.5 transition-colors"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        <span>Doctor Portal {isDoctor && '(Assigned)'}</span>
                      </button>
                      <button
                        id="user-dropdown-admin-portal-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavClick('admin');
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-amber-900 bg-amber-50/70 hover:bg-amber-100/70 rounded-lg flex items-center gap-2 cursor-pointer my-0.5 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Admin Portal {isAdmin && '(Unlocked)'}</span>
                      </button>
                      <button
                        id="user-signout-btn"
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-signin-btn"
                onClick={() => openAuthModal('signin')}
                className="px-3.5 py-2 rounded-lg border border-slate-300 hover:border-teal-500 bg-white hover:bg-teal-50/50 text-slate-700 hover:text-teal-700 text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-teal-600" />
                <span>Sign In</span>
              </button>
            )}

            <button
              id="header-book-appointment-btn"
              onClick={() => onOpenBooking()}
              className="px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold shadow-sm shadow-teal-600/25 transition-all duration-150 flex items-center gap-2 cursor-pointer group"
            >
              <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {!currentUser && (
              <button
                id="mobile-header-signin-btn"
                onClick={() => openAuthModal('signin')}
                className="p-2 rounded-lg border border-slate-200 text-teal-700 hover:bg-slate-50 transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            <button
              id="mobile-book-icon-btn"
              onClick={() => onOpenBooking()}
              className="p-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
              aria-label="Book Appointment"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in fade-in duration-150">
          {currentUser && (
            <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-100 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {!currentUser && (
              <button
                id="mobile-nav-signin-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('signin');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                <LogIn className="w-4 h-4 text-teal-600" />
                <span>Patient Sign In / Register</span>
              </button>
            )}

            <button
              id="mobile-nav-book-appointment-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-teal-600 text-white font-semibold text-sm shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Doctor Appointment</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="mobile-nav-appointments-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAppointments();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>My Bookings ({appointmentsCount})</span>
              </button>

              <button
                id="mobile-nav-emergency-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEmergency();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold"
              >
                <Ambulance className="w-3.5 h-3.5 text-red-600" />
                <span>Emergency 24/7</span>
              </button>
            </div>

            <button
              id="mobile-nav-doctor-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('doctor');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-bold text-xs transition-colors cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Doctor Portal {isDoctor && '(Assigned)'}</span>
            </button>

            <button
              id="mobile-nav-admin-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('admin');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Portal {isAdmin && '(Unlocked)'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

