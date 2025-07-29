
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAppointments,
  bookAppointment,
  updateAppointmentStatus,
  clearMessages,
} from '../../../store/appointmentSlice';
import AppointmentCalendar from './AppointmentCalender';
import AppointmentList from './AppointmentList';
import BookAppointmentModal from './BookAppointmentModal';
import axiosInstance from '../../../utils/axiosInstance';

const AppointmentPage = () => {
  const dispatch = useDispatch();
  const { userId, role } = useSelector((state) => state.auth);
  const {
    appointments,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.appointments);

  const [doctors, setDoctors] = useState([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch appointments on load
  useEffect(() => {
    if (userId) {
      dispatch(fetchAppointments({ userId, role }));
    }
    if (role === 'patient') {
      fetchDoctors();
    }
  }, [dispatch,userId, role]);

  // Clear messages after a delay
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => dispatch(clearMessages()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const fetchDoctors = async () => {
    try {
      const res = await axiosInstance.get('/doctors.json');
      if (res.data) {
        const doctorList = Object.entries(res.data)
          .map(([id, doctor]) => ({ id, ...doctor }));
        setDoctors(doctorList);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleBookAppointment = (formData) => {

    const appointmentData = {
      ...formData,
      doctorId:formData.doctorId,
    };

    dispatch(bookAppointment({
      appointmentData,
      patientId:userId,
    }));

    setShowBookModal(false);
  };

  const handleStatusUpdate = (appointmentId, newStatus) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (!appointment) return;

    dispatch(updateAppointmentStatus({
      appointmentId,
      newStatus,
      appointment,
    }));
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>{role === 'doctor' ? 'Doctor Appointments' : 'My Appointments'}</h2>

          {successMessage && (
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {role === 'patient' && (
            <Button
              variant="primary"
              className="mb-3"
              onClick={() => setShowBookModal(true)}
            >
              Book New Appointment
            </Button>
          )}
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5>Appointment Calendar</h5>
            </Card.Header>
            <Card.Body>
              <AppointmentCalendar
                appointments={appointments}
                onDateSelect={setSelectedDate}
                role={role}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5>Appointments List</h5>
            </Card.Header>
            <Card.Body>
              <AppointmentList
                appointments={appointments}
                loading={loading}
                role={role}
                onStatusUpdate={handleStatusUpdate}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {role === 'patient' && (
        <BookAppointmentModal
          show={showBookModal}
          onHide={() => setShowBookModal(false)}
          doctors={doctors}
          onBook={handleBookAppointment}
          selectedDate={selectedDate}
        />
      )}
    </Container>
  );
};

export default AppointmentPage;
