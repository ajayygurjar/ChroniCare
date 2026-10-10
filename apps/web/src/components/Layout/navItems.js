import { LuHouse, LuCalendarDays, LuFileText, LuUsers, LuCircleHelp } from 'react-icons/lu';

const help = { label: 'Help', short: 'Help', path: '/contact', icon: LuCircleHelp };

export const navItems = {
  patient: [
    { label: 'Home', short: 'Home', path: '/dashboard', icon: LuHouse },
    { label: 'Appointments', short: 'Visits', path: '/appointments', icon: LuCalendarDays },
    { label: 'Medical history', short: 'Records', path: '/patient/history', icon: LuFileText },
    help,
  ],
  doctor: [
    { label: 'Home', short: 'Home', path: '/dashboard', icon: LuHouse },
    { label: 'Patients', short: 'Patients', path: '/doctor/patients', icon: LuUsers },
    { label: 'Appointments', short: 'Visits', path: '/appointments', icon: LuCalendarDays },
    help,
  ],
};
