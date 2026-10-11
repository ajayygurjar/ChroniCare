import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { LuPlus, LuCalendarDays } from 'react-icons/lu';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  fetchAppointments,
  bookAppointment,
  updateAppointmentStatus,
  clearMessages,
} from '../../../store/appointmentSlice';
import AppointmentCalendar from './AppointmentCalender';
import AppointmentList from './AppointmentList';
import BookAppointmentModal from './BookAppointmentModal';
import PageHeader from '../Common/PageHeader';
import EmptyState from '../Common/EmptyState';
import LoadingSpinner from '../Common/LoadingSpinner';
import api from '../../../utils/axiosInstance';
import { useProfile } from '../../hooks/userProfile';
import { useAppointmentsStats } from '../../hooks/useAppointmentsStats';
import { formatLongDate, toLocalISODate, fullName, appointmentStart } from '../../../utils/format';

const AppointmentPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, role } = useSelector((state) => state.auth);
  const {
    appointments,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.appointments);

  const { profile } = useProfile();
  const { upcomingList } = useAppointmentsStats(appointments);

  const [doctors, setDoctors] = useState([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookError, setBookError] = useState(null);
  const [showPast, setShowPast] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Fetch appointments (and, for patients, the doctors to choose from) on load
  useEffect(() => {
    if (userId) {
      dispatch(fetchAppointments());
    }
    if (role === 'patient') {
      fetchDoctors();
    }
  }, [dispatch, userId, role]);

  // "Book visit" on the dashboard links here with state.book to open the form straight away.
  useEffect(() => {
    if (location.state?.book && role === 'patient') {
      setShowBookModal(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate, role]);

  // Clear messages after a delay
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => dispatch(clearMessages()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/doctors');
      setDoctors(data.doctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const openBookModal = () => {
    setBookError(null);
    setShowBookModal(true);
  };

  // Close the form only when the server accepted the request; a taken slot keeps it open with the reason.
  const handleBookAppointment = async (formData) => {
    setBookError(null);
    const result = await dispatch(bookAppointment({ appointmentData: formData }));
    if (bookAppointment.fulfilled.match(result)) {
      setShowBookModal(false);
    } else {
      setBookError(result.payload);
    }
  };

  const handleStatusUpdate = (appointmentId, newStatus) => {
    dispatch(updateAppointmentStatus({ appointmentId, newStatus }));
  };

  const selectedKey = toLocalISODate(selectedDate);
  const dayAppointments = appointments
    .filter((app) => app.date === selectedKey)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const past = appointments
    .filter((app) => !upcomingList.includes(app))
    .sort((a, b) => appointmentStart(b) - appointmentStart(a));

  const isPatient = role === 'patient';
  const upcomingCount = upcomingList.length;

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle={
          isPatient
            ? 'Select a day to see its visits'
            : `${upcomingCount} upcoming ${upcomingCount === 1 ? 'visit' : 'visits'} · select a day to see its schedule`
        }
        action={
          isPatient && (
            <Button onClick={() => openBookModal()}>
              <LuPlus aria-hidden="true" /> Book visit
            </Button>
          )
        }
      />

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {loading && appointments.length === 0 ? (
        <LoadingSpinner message="Loading appointments..." />
      ) : (
        <div className="cc-grid g32 top">
          <div className="cc-card">
            <AppointmentCalendar
              appointments={appointments}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>

          <div className="cc-stack">
            <div className="cc-card">
              <div className="cc-eyebrow">{formatLongDate(selectedDate)}</div>
              {dayAppointments.length > 0 ? (
                <AppointmentList
                  appointments={dayAppointments}
                  role={role}
                  onStatusUpdate={handleStatusUpdate}
                  showDate={false}
                />
              ) : (
                <EmptyState icon={LuCalendarDays} message="No visits on this day">
                  {isPatient && (
                    <Button variant="ghost" size="sm" onClick={() => openBookModal()}>
                      Book for this day
                    </Button>
                  )}
                </EmptyState>
              )}
            </div>

            <div className="cc-card">
              <div className="cc-eyebrow">Upcoming</div>
              {upcomingList.length > 0 ? (
                <AppointmentList
                  appointments={upcomingList}
                  role={role}
                  onStatusUpdate={handleStatusUpdate}
                />
              ) : (
                <p className="cc-sub mb-0">Nothing coming up.</p>
              )}

              {past.length > 0 && (
                <>
                  <div className="d-flex justify-content-between align-items-baseline mt-3">
                    <div className="cc-eyebrow inline">
                      Past <span style={{ fontWeight: 500, letterSpacing: 0, textTransform: 'none' }}>· {past.length}</span>
                    </div>
                    <button
                      type="button"
                      className="cc-link"
                      onClick={() => setShowPast((v) => !v)}
                      aria-expanded={showPast}
                    >
                      {showPast ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showPast && (
                    <AppointmentList
                      appointments={past}
                      role={role}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isPatient && (
        <BookAppointmentModal
          show={showBookModal}
          onHide={() => setShowBookModal(false)}
          doctors={doctors}
          onBook={handleBookAppointment}
          selectedDate={selectedDate}
          patientName={fullName(profile)}
          error={bookError}
        />
      )}
    </>
  );
};

export default AppointmentPage;
