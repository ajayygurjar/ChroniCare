import { useMemo } from 'react';
import { appointmentStart, toLocalISODate } from '../../utils/format';

const ACTIVE = ['pending', 'confirmed'];

export const useAppointmentsStats = (appointments = []) => {
  return useMemo(() => {
    const now = new Date();
    const today = toLocalISODate(now);

    const byStart = (a, b) => appointmentStart(a) - appointmentStart(b);

    const upcomingList = appointments
      .filter(app => ACTIVE.includes(app.status) && appointmentStart(app) >= now)
      .sort(byStart);

    const pendingList = appointments
      .filter(app => app.status === 'pending')
      .sort(byStart);

    const todayAppointments = appointments
      .filter(app => app.date === today)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const stats = {
      total: appointments.length,
      pending: pendingList.length,
      confirmed: appointments.filter(app => app.status === 'confirmed').length,
      completed: appointments.filter(app => app.status === 'completed').length,
      cancelled: appointments.filter(app => app.status === 'cancelled').length,
      todayTotal: todayAppointments.length,
      todayCompleted: todayAppointments.filter(app => app.status === 'completed').length,
      upcoming: upcomingList.length,
    };

    return {
      stats,
      nextAppointment: upcomingList[0],
      upcomingList,
      pendingList,
      todayAppointments,
    };
  }, [appointments]);
};
