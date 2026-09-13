import React from 'react';
import {
  HeartPulse,
  Brain,
  Activity,
  Baby,
  ShieldAlert,
  Stethoscope,
  Sparkles,
  Ambulance,
  Award,
  Users,
  HeartHandshake,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Microscope,
  FileText,
  BadgeCheck,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Star,
  UserCheck,
  HelpCircle,
  GraduationCap,
  LucideIcon
} from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  HeartPulse,
  Brain,
  Activity,
  Baby,
  ShieldAlert,
  Stethoscope,
  Sparkles,
  Ambulance,
  Award,
  Users,
  HeartHandshake,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Microscope,
  FileText,
  BadgeCheck,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Star,
  UserCheck,
  HelpCircle,
  GraduationCap,
};

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = iconMap[name] || Stethoscope;
  return <IconComponent className={className} />;
};
