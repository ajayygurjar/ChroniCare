import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Alert, Button } from "react-bootstrap";
import { LuCalendarDays, LuHourglass, LuCheck, LuUsers, LuChevronRight, LuInbox, LuCalendarCheck } from "react-icons/lu";
import { fetchAppointments, updateAppointmentStatus } from "../../../store/appointmentSlice";
import { fetchAllPatients } from "../../../store/doctorSlice";

import LoadingSpinner from "../Common/LoadingSpinner";
import StatCard from "../Common/StatCard";
import PageHeader from "../Common/PageHeader";
import Avatar from "../Common/Avatar";
import StatusChip from "../Common/StatusChip";
import EmptyState from "../Common/EmptyState";

import { useProfile } from "../../hooks/userProfile";
import { useAppointmentsStats } from "../../hooks/useAppointmentsStats";
import {
  greeting,
  formatLongDate,
  formatShortDate,
  formatTime,
  parseLocalDate,
  appointmentStart,
  fullName,
} from "../../../utils/format";

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { userId } = useSelector((state) => state.auth);
  const { appointments, error } = useSelector((state) => state.appointments);
  const { patients } = useSelector((state) => state.doctor);

  const { profile, loading } = useProfile('doctor');
  const { stats, pendingList, todayAppointments } = useAppointmentsStats(appointments);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAppointments({ userId, role: 'doctor' }));
      dispatch(fetchAllPatients());
    }
  }, [dispatch, userId]);

  if (loading || !profile) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const respond = (appointment, newStatus) =>
    dispatch(updateAppointmentStatus({ appointmentId: appointment.id, newStatus, appointment }));

  const now = new Date();
  const nowIndex = todayAppointments.findIndex(
    (a) => ['pending', 'confirmed'].includes(a.status) && appointmentStart(a) >= now
  );

  // Patients from the most recent appointments, joined with the patient list for age/gender/address.
  const recentPatients = [];
  [...appointments]
    .sort((a, b) => appointmentStart(b) - appointmentStart(a))
    .forEach((a) => {
      if (a.patientId && !recentPatients.some((p) => p.id === a.patientId)) {
        const known = patients.find((p) => p.id === a.patientId);
        recentPatients.push({ id: a.patientId, name: a.patientName, details: known });
      }
    });

  const requestCount = pendingList.length;

  return (
    <>
      <PageHeader
        title={`${greeting()}, Dr. ${profile.lastName || profile.firstName}`}
        subtitle={`${formatLongDate(now)} · ${
          requestCount > 0
            ? `${requestCount} ${requestCount === 1 ? 'request' : 'requests'} waiting for you`
            : 'No requests waiting'
        }`}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="cc-grid cols-4">
        <StatCard icon={LuCalendarDays} value={stats.total} label="Appointments" />
        <StatCard icon={LuHourglass} value={stats.pending} label="Pending" />
        <StatCard icon={LuCheck} value={stats.todayCompleted} label="Done today" />
        <StatCard icon={LuUsers} value={patients.length} label="Patients" />
      </div>

      <div className="cc-grid g32 top">
        <div className="cc-card">
          <div className="cc-eyebrow">Pending requests</div>
          {pendingList.length > 0 ? (
            <ul className="cc-list">
              {pendingList.map((a) => {
                const day = parseLocalDate(a.date);
                return (
                  <li className="cc-li" key={a.id}>
                    <Avatar name={a.patientName} />
                    <div className="cc-li-body">
                      <span className="cc-li-title">{a.patientName || 'Unknown patient'}</span>
                      <div className="cc-sub">
                        {day && formatShortDate(day)}
                        {a.time && ` · ${formatTime(a.time)}`}
                        {a.reason && ` · ${a.reason}`}
                      </div>
                    </div>
                    <div className="cc-li-actions">
                      <Button size="sm" variant="ghost-danger" onClick={() => respond(a, 'cancelled')}>
                        Decline
                      </Button>
                      <Button size="sm" onClick={() => respond(a, 'confirmed')}>
                        Confirm
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={LuInbox} message="You're all caught up. New requests will appear here." />
          )}
        </div>

        <div className="cc-card">
          <div className="cc-eyebrow">Today</div>
          {todayAppointments.length > 0 ? (
            todayAppointments.map((a, i) => (
              <div className="cc-tl" key={a.id}>
                <span className="cc-tl-time">{a.time || '--:--'}</span>
                <div className={`cc-tl-body${i === nowIndex ? ' now' : ''}`}>
                  <b>{a.patientName || 'Unknown patient'}</b>
                  {a.reason && <div className="cc-sub">{a.reason}</div>}
                  <div style={{ marginTop: 4 }}>
                    <StatusChip status={a.status} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon={LuCalendarCheck} message="Nothing scheduled for today" />
          )}
        </div>
      </div>

      <div className="cc-card">
        <div className="cc-card-head">
          <div className="cc-eyebrow">Recent patients</div>
          <Link to="/doctor/patients" className="cc-link">All patients</Link>
        </div>
        {recentPatients.length > 0 ? (
          <ul className="cc-list">
            {recentPatients.slice(0, 4).map(({ id, name, details }) => (
              <li key={id}>
                <Link to={`/doctor/patient/${id}`} className="cc-li">
                  <Avatar name={fullName(details) || name} />
                  <div className="cc-li-body">
                    <span className="cc-li-title">{fullName(details) || name}</span>
                    {details && (
                      <div className="cc-sub">
                        {[details.age, details.gender, details.address].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                  <LuChevronRight className="cc-chev" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={LuUsers} message="Patients you see will show up here" />
        )}
      </div>
    </>
  )
}

export default DoctorDashboard
