import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointments } from "../../../store/appointmentSlice";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LuPlus, LuCalendarDays, LuHourglass, LuClock, LuPill, LuFileText } from "react-icons/lu";

import LoadingSpinner from "../Common/LoadingSpinner";
import StatCard from "../Common/StatCard";
import ProfileCard from "../Common/ProfileCard";
import PageHeader from "../Common/PageHeader";
import AppointmentCard from "../Common/AppointmentCard";
import EmptyState from "../Common/EmptyState";

import { useProfile } from "../../hooks/userProfile";
import { useAppointmentsStats } from "../../hooks/useAppointmentsStats";
import { usePatientHistory } from "../../hooks/usePatientHistory";
import { greeting, formatLongDate } from "../../../utils/format";

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { userId } = useSelector((state) => state.auth);
  const { appointments } = useSelector((state) => state.appointments);

  const { profile, loading } = useProfile("patient");
  const { stats, nextAppointment } = useAppointmentsStats(appointments);
  const { history } = usePatientHistory(userId);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAppointments({ userId, role: "patient" }));
    }
  }, [dispatch, userId]);

  if (loading || !profile) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const profileFields = [
    { label: "Name", key: "firstName", transform: (data) => `${data.firstName} ${data.lastName}` },
    { label: "Age", key: "age", transform: (data) => data.age && `${data.age} years` },
    { label: "Gender", key: "gender" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Address", key: "address" },
  ];

  const prescribed = history.filter((r) => r.prescription).slice(0, 3);
  const recent = history.slice(0, 3);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${profile.firstName}`}
        subtitle={`${formatLongDate(new Date())} · ${stats.upcoming} upcoming ${stats.upcoming === 1 ? "visit" : "visits"}`}
        action={
          <Button as={Link} to="/appointments" state={{ book: true }}>
            <LuPlus aria-hidden="true" /> Book visit
          </Button>
        }
      />

      <div className="cc-grid g21 top">
        <AppointmentCard
          title="Next appointment"
          role="patient"
          appointment={nextAppointment}
          emptyMessage="No upcoming appointments"
          emptyAction={
            <Button as={Link} to="/appointments" state={{ book: true }} size="sm">
              Book now
            </Button>
          }
        >
          <div className="mt-3">
            <Link to="/appointments" className="cc-link">
              All appointments
            </Link>
          </div>
        </AppointmentCard>

        <div className="cc-card">
          <div className="cc-eyebrow">Latest prescriptions</div>
          {prescribed.length > 0 ? (
            prescribed.map(({ id, prescription, diagnosis }) => (
              <div className="cc-rx" key={id}>
                <span className="cc-rx-icon" aria-hidden="true"><LuPill /></span>
                <div>
                  <b>{prescription.drug}</b>
                  <span>
                    {[prescription.time, prescription.meal].filter(Boolean).join(" · ")}
                    {diagnosis && ` · for ${diagnosis}`}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon={LuPill} message="No prescriptions yet" />
          )}
        </div>
      </div>

      <div className="cc-grid cols-3 compact">
        <StatCard icon={LuCalendarDays} value={stats.total} label="Total visits" />
        <StatCard icon={LuHourglass} value={stats.pending} label="Awaiting confirmation" />
        <StatCard icon={LuClock} value={stats.upcoming} label="Upcoming" />
      </div>

      <div className="cc-grid g21 top">
        <div className="cc-card">
          <div className="cc-card-head">
            <div className="cc-eyebrow">Recent records</div>
            <Link to="/patient/history" className="cc-link">View all</Link>
          </div>
          {recent.length > 0 ? (
            <ul className="cc-list">
              {recent.map((record) => {
                const date = record.date ? new Date(record.date) : null;
                return (
                  <li className="cc-li" key={record.id}>
                    <div className="cc-when">
                      <b>{date ? String(date.getDate()).padStart(2, "0") : "--"}</b>
                      <span>{date ? date.toLocaleDateString("en-US", { month: "short" }) : ""}</span>
                    </div>
                    <div className="cc-li-body">
                      <span className="cc-li-title">{record.diagnosis}</span>
                      <div className="cc-sub text-truncate">{record.notes}</div>
                    </div>
                    {record.prescription && <span className="cc-chip">Prescription</span>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={LuFileText} message="No records yet">
              <Button as={Link} to="/patient/history" variant="ghost" size="sm">
                Add a record
              </Button>
            </EmptyState>
          )}
        </div>

        <ProfileCard title="Your details" profileData={profile} fields={profileFields} />
      </div>
    </>
  );
};

export default PatientDashboard;
