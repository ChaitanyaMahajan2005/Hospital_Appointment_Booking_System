import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  HeartPulse,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    pendingPostAuthAction,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (authModalMode === 'signin') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        await loginWithEmail(email.trim(), password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please provide a valid email address.');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (!phone.trim()) {
          throw new Error('Please provide a contact phone number for appointment notifications.');
        }
        await registerWithEmail(email.trim(), password, name.trim(), phone.trim());
      }
    } catch (err: any) {
      console.warn('Authentication notice:', err?.code || err?.message);
      let message = err?.message || 'Authentication failed. Please try again.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        message = 'Invalid email or password. If you do not have an account yet, please click "Sign Up" below.';
      } else if (err?.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please sign in instead.';
      } else if (err?.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was closed before finishing.';
      } else if (err?.code === 'auth/popup-blocked') {
        message = 'Popup was blocked by browser. Please enable popups for this site.';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google sign-in notice:', err?.code || err?.message);
      let message = err?.message || 'Google sign-in failed.';
      if (err?.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was closed before completing.';
      } else if (err?.code === 'auth/cancelled-popup-request') {
        message = 'Sign-in cancelled.';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 relative">
          <button
            id="auth-modal-close-btn"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 border border-white/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] tracking-tight">
                M. Y. Hospital Patient Portal
              </h2>
              <p className="text-xs text-teal-200">
                {pendingPostAuthAction ? 'Sign in required to proceed with booking' : 'Access your appointments & health profile'}
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="mt-4 grid grid-cols-2 p-1 bg-black/20 rounded-xl border border-white/10">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => {
                setAuthModalMode('signin');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authModalMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setAuthModalMode('signup');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authModalMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div
              id="auth-error-banner"
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Auth Quick Button */}
          <button
            id="auth-google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-xs disabled:opacity-60 cursor-pointer mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-1 items-center mb-5">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-slate-400 text-xs uppercase font-medium tracking-wider">
              Or with email
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="auth-input-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-800 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="auth-input-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-800 outline-hidden transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="auth-input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-800 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="auth-input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authModalMode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-800 outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{authModalMode === 'signin' ? 'Sign In to Portal' : 'Create Patient Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Encrypted patient authentication secured by Firebase Firestore</span>
          </div>
        </div>
      </div>
    </div>
  );
};
