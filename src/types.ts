export type Page = 'home' | 'about' | 'departments' | 'doctors' | 'book-appointment' | 'admin';

export interface Department {
  id: string;
  name: string;
  iconName: string;
  tagline: string;
  badge?: string;
  description: string;
  headOfDepartment: string;
  establishedYear: number;
  bedCount: number;
  procedures: string[];
  facilities: string[];
  contactExtension: string;
  accentColor: string;
  image: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  specialty: string;
  experienceYears: number;
  experienceBadge?: string;
  degrees: string[];
  qualification?: string;
  fellowships?: string[];
  rating: number;
  reviewCount: number;
  consultationFee: number;
  languages: string[];
  availabilityDays: string[];
  availabilityText?: string;
  timeSlots: string[];
  photoUrl: string;
  bio: string;
  roomLocation: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  visitType: 'New Consultation' | 'Follow-up' | 'Second Opinion' | 'Routine Health Check';
  symptoms?: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
  tokenNumber: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  treatment: string;
  department: string;
  doctorName?: string;
  secondaryText?: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export interface HospitalStat {
  label: string;
  value: string;
  subtext: string;
  iconName: string;
}
