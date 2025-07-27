import React, { useEffect,  } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointments } from "../../../store/appointmentSlice";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

import  LoadingSpinner  from "../Common/LoadingSpinner";
import  StatCard  from "../Common/StatCard";
import  ProfileCard  from "../Common/ProfileCard";
import  WelcomeCard  from "../Common/WelcomeCard";
import  AppointmentCard  from "../Common/AppointmentCard";
import  QuickActionsCard  from "../Common/QuickActionsCard";


import { useProfile } from "../../hooks/userProfile";
import { useAppointmentsStats } from "../../hooks/useAppointmentsStats";



const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { userId } = useSelector((state) => state.auth);
  const { appointments } = useSelector((state) => state.appointments);
  
  const { profile, loading,} = useProfile('patient');
  const { stats, nextAppointment } = useAppointmentsStats(appointments, 'patient');
  

  useEffect(() => {
    if (userId) {
      dispatch(fetchAppointments({ userId, role: 'patient' }));
    }
  }, [dispatch, userId]);

  

  if (loading || !profile) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const profileFields = [
    { label: "Name", key: "firstName", transform: (data) => `${data.firstName} ${data.lastName}` },
    { label: "Age", key: "age", transform: (data) => `${data.age} years` },
    { label: "Gender", key: "gender" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Address", key: "address" }
  ];

  const quickActions = [
    {
      icon: "📅",
      label: "Appointments",
      buttonProps: { as: Link, to: "/appointments", variant: "primary" }
    },
    {
      icon: "🏥",
      label: "Medical History",
      buttonProps: { as: Link, to: "/patient/history", variant: "success" }
    },
    {
      icon: "💊",
      label: "Prescriptions",
      buttonProps: {  as: Link, to: "/patient/prescriptions", variant: "info" }
    },
    {
      icon: "📞",
      label: "Contact",
      buttonProps: { variant: "warning" }
    }
  ];

  return (
    <Container className="mt-4">

      <WelcomeCard 
        name={profile.firstName}
        subtitle="Manage your health records and appointments"
        bgClass="bg-primary"
      />


      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <StatCard 
            value={stats.total}
            label="Total Appointments"
            color="primary"
          />
        </Col>
        <Col md={4} className="mb-3">
          <StatCard 
            value={stats.pending}
            label="Pending"
            color="warning"
          />
        </Col>
        <Col md={4} className="mb-3">
          <StatCard 
            value={stats.upcoming}
            label="Upcoming"
            color="success"
          />
        </Col>
      </Row>

      <Row>
        
        <Col lg={6} className="mb-4">
          <ProfileCard
            title="My Profile"
            profileData={profile}

            fields={profileFields}
          />
        </Col>

        <Col lg={6} className="mb-4">
          <AppointmentCard
            title="Next Appointment"
            appointment={nextAppointment}
            emptyMessage="No upcoming appointments"
            emptyAction={{
              label: "Book Now",
              buttonProps: { as: Link, to: "/appointments", variant: "primary", size: "sm" }
            }}
          />
        </Col>
      </Row>


      <QuickActionsCard actions={quickActions} />
    </Container>
  );
};

export default PatientDashboard;