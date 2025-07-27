import { useMemo } from 'react';

export const useAppointmentsStats = (appointments = [], role) => {
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      total: appointments.length,
      pending: appointments.filter(app => app.status === 'pending').length,
      confirmed: appointments.filter(app => app.status === 'confirmed').length,
      completed: appointments.filter(app => app.status === 'completed').length,
      cancelled: appointments.filter(app => app.status === 'cancelled').length,
      
       todayTotal: appointments.filter(app => app.date?.split('T')[0] === today).length,
      todayCompleted: appointments.filter(app => 
        app.date?.split('T')[0] === today && app.status === 'completed'
      ).length,
      
       upcoming: appointments.filter(app => 
        new Date(app.date) >= new Date() && app.status !== 'cancelled'
      ).length
    };

 
    const nextAppointment = appointments
      .filter(app => new Date(app.date) >= new Date() && app.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    const todayAppointments = appointments
      .filter(app => app.date?.split('T')[0] === today)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    return {
      stats,
      nextAppointment,
      todayAppointments
    };
  }, [appointments, role]);
};