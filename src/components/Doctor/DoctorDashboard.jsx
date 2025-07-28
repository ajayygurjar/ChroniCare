import React,{ useEffect} from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col } from "react-bootstrap";
import { fetchAppointments } from "../../../store/appointmentSlice";
import { fetchAllPatients } from "../../../store/doctorSlice";

import LoadingSpinner from "../Common/LoadingSpinner";
import StatCard from "../Common/StatCard";
import ProfileCard from "../Common/ProfileCard";
import WelcomeCard from "../Common/WelcomeCard";
import AppointmentCard from "../Common/AppointmentCard";

import { useProfile } from "../../hooks/userProfile";
import { useAppointmentsStats } from "../../hooks/useAppointmentsStats";

const DoctorDashboard = () => {
    const dispatch = useDispatch();
  const { userId } = useSelector((state) => state.auth);
  const { appointments } = useSelector((state) => state.appointments);
  const { patients } = useSelector((state) => state.doctor);
  
  const { profile, loading } = useProfile('doctor');
  const { stats, nextAppointment } = useAppointmentsStats(appointments, 'doctor');

  useEffect(() => {
    if (userId) {
      dispatch(fetchAppointments({ userId, role: 'doctor' }));
      dispatch(fetchAllPatients());
    }
  }, [dispatch, userId]);

  if (loading || !profile) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const profileFields = [
    { label: "Name", key: "firstName", transform: (data) => `Dr. ${data.firstName} ${data.lastName}` },
    { label: "Speciality", key: "speciality" },
    { label: "Experience", key: "experience", transform: (data) => `${data.experience} years` },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Address", key: "address" }
  ];

  return (
     <Container className="mt-4">
      <WelcomeCard 
        name={`Dr. ${profile.firstName}`}
        subtitle={`${profile.speciality} • ${profile.experience} years experience`}
        bgClass="bg-success"
        icon="👨‍⚕️"
      />

      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <StatCard 
            icon="📅"
            value={stats.total}
            label="Total Appointments"
            color="primary"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatCard 
            icon="⏳"
            value={stats.pending}
            label="Pending"
            color="warning"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatCard 
            icon="✅"
            value={stats.todayCompleted}
            label="Today Completed"
            color="success"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <StatCard 
            icon="👥"
            value={patients.length}
            label="Total Patients"
            color="info"
          />
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <ProfileCard
            title="My Profile"
            profileData={profile}
            fields={profileFields}
            icon="👨‍⚕️"
          />
        </Col>

        <Col lg={6} className="mb-4">
          <AppointmentCard
            title="Next Appointment"
            appointment={nextAppointment}
            emptyMessage="No upcoming appointments"
            icon="📅"
          />
        </Col>
      </Row>
    </Container>
  )
}

export default DoctorDashboard