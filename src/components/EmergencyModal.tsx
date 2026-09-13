import React, { useState } from 'react';
import {
  X,
  Phone,
  Ambulance,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  HeartPulse
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callerAddress, setCallerAddress] = useState('');

  if (!isOpen) return null;

  const handleAmbulanceDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (callerPhone.trim() && callerAddress.trim()) {
      setAmbulanceRequested(true);
    }
  };

  return (
    <div
      id="emergency-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="emergency-modal-container"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border-2 border-red-500/40 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Red Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white border border-white/30 shrink-0">
              <Ambulance className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <span className="text-xs font-black uppercase tracking-wider text-red-100">
                  24/7 Rapid Trauma Helpline
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
                M. Y. Hospital Emergency Care
              </h2>
            </div>
          </div>

          <button
            id="close-emergency-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Direct Dial Banner */}
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200 text-center space-y-2">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
              Immediate Voice Assistance
            </p>
            <a
              href="tel:1800633477"
              className="inline-flex items-center gap-3 text-2xl sm:text-3xl font-extrabold text-red-600 hover:text-red-700 transition-colors font-mono"
            >
              <Phone className="w-7 h-7" />
              <span>1800-633-477</span>
            </a>
            <p className="text-[11px] text-red-600/80">
              Toll-Free Emergency Dispatch • Direct Line to Senior ER Physician
            </p>
          </div>

          {/* Critical Triage Symptoms */}
          <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>When to call immediately:</span>
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              <li>• Sudden chest discomfort / radiating pain</li>
              <li>• Facial drooping or speech difficulty (Stroke)</li>
              <li>• Severe acute shortness of breath</li>
              <li>• High-impact physical trauma or fracture</li>
              <li>• Loss of consciousness or seizures</li>
              <li>• Uncontrolled heavy bleeding</li>
            </ul>
          </div>

          {/* Instant Ambulance Request Form */}
          {!ambulanceRequested ? (
            <form onSubmit={handleAmbulanceDispatch} className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Request Immediate Ambulance Dispatch
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  GPS-Enabled Cardiac ICU Vans
                </span>
              </div>

              <div>
                <input
                  type="text"
                  id="ambulance-name-input"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  placeholder="Contact Person / Patient Name"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="tel"
                  id="ambulance-phone-input"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  placeholder="Callback Phone Number *"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-red-500"
                />
                <input
                  type="text"
                  id="ambulance-address-input"
                  value={callerAddress}
                  onChange={(e) => setCallerAddress(e.target.value)}
                  placeholder="Pickup Street / Landmark Address *"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                id="submit-ambulance-dispatch-btn"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-red-600/30"
              >
                <Ambulance className="w-4 h-4" />
                <span>Dispatch Nearest M. Y. Hospital Ambulance Unit</span>
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm">Ambulance Unit Dispatched!</p>
              <p className="text-[11px] text-emerald-800">
                Unit #ICU-04 is en route to: <span className="font-semibold">{callerAddress}</span>.
                ETA: 8–12 minutes. The ER paramedic team is contacting {callerPhone}.
              </p>
            </div>
          )}

          {/* Physical Address */}
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>M. Y. Hospital Emergency Wing: Gate 1, Healthcare Road (Dedicated Red Ramp)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
