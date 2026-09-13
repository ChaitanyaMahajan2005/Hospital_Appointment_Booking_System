import React from 'react';
import { Appointment } from '../types';
import {
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  CalendarPlus,
  Trash2
} from 'lucide-react';

interface MyAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onCancelAppointment: (appointmentId: string) => void;
  onOpenBooking: () => void;
}

export const MyAppointmentsModal: React.FC<MyAppointmentsModalProps> = ({
  isOpen,
  onClose,
  appointments,
  onCancelAppointment,
  onOpenBooking,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="my-appointments-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="my-appointments-modal-container"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 border border-white/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-['Outfit']">
                My Booked Appointments
              </h2>
              <p className="text-xs text-teal-200/80">
                Manage your consultations at M. Y. Hospital
              </p>
            </div>
          </div>

          <button
            id="close-my-appointments-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {appointments.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">No Scheduled Appointments</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You do not have any active appointments. Choose from our specialized departments and book online in 60 seconds.
                </p>
              </div>
              <button
                id="empty-schedule-appointment-btn"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 mx-auto cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Schedule New Appointment</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>Total Bookings: {appointments.length}</span>
                <span>M. Y. Hospital Central OPD Desk</span>
              </div>

              {appointments.map((apt) => {
                const isCancelled = apt.status === 'Cancelled';
                return (
                  <div
                    key={apt.id}
                    id={`appointment-card-${apt.id}`}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                      isCancelled
                        ? 'bg-slate-50/70 border-slate-200 opacity-70'
                        : 'bg-white border-slate-200/90 hover:border-teal-200 shadow-xs'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {apt.id}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          Token: {apt.tokenNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isCancelled
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCancelled ? 'bg-slate-500' : 'bg-emerald-500'
                            }`}
                          ></span>
                          {apt.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Doctor & Department
                        </span>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="font-bold text-slate-900">{apt.doctorName}</span>
                        </div>
                        <p className="text-slate-600 pl-6 mt-0.5">{apt.departmentName}</p>
                        <p className="text-teal-700 font-medium pl-6 text-[11px]">
                          {apt.doctorSpecialty}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Schedule & Patient
                        </span>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="font-bold text-slate-900">
                            {apt.appointmentDate} at {apt.appointmentTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pl-6 mt-1 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {apt.patientName} ({apt.patientAge}y, {apt.patientGender})
                          </span>
                        </div>
                        <p className="text-slate-500 pl-6 text-[11px] mt-0.5">
                          Type: {apt.visitType}
                        </p>
                      </div>
                    </div>

                    {apt.symptoms && (
                      <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 text-[11px] mb-3">
                        <span className="font-semibold text-slate-700">Reason / Symptoms:</span>{' '}
                        {apt.symptoms}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[10px]">
                        Booked: {new Date(apt.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id={`print-apt-${apt.id}`}
                          onClick={() => window.print()}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Slip</span>
                        </button>

                        {!isCancelled && (
                          <button
                            type="button"
                            id={`cancel-apt-${apt.id}`}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to cancel appointment ${apt.id} with ${apt.doctorName}?`
                                )
                              ) {
                                onCancelAppointment(apt.id);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            id="modal-book-another-cta"
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>

          <button
            type="button"
            id="close-my-appointments-footer-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
