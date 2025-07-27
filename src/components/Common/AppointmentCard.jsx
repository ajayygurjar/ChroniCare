import React from 'react';
import { Card, Badge, Button, Stack } from 'react-bootstrap';

const AppointmentCard = ({
  title,
  appointment,
  emptyMessage,
  emptyAction,
  icon = "📅"
}) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

  const getStatusVariant = (status) => ({
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'danger'
  }[status] || 'secondary');

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="bg-light">
        <Stack direction="horizontal" gap={2}>
          <span style={{ fontSize: '1.25rem' }}>{icon}</span>
          <h5 className="mb-0">{title}</h5>
        </Stack>
      </Card.Header>
      <Card.Body>
        {appointment ? (
          <Stack gap={2}>
            <div><strong>Name:</strong> {appointment.doctorName || appointment.patientName}</div>
            <div><strong>Date:</strong> {formatDate(appointment.date)}</div>
            {appointment.time && <div><strong>Time:</strong> {appointment.time}</div>}
            {appointment.reason && <div><strong>Reason:</strong> {appointment.reason}</div>}
            {appointment.department && <div><strong>Department:</strong> {appointment.department}</div>}
            <Badge bg={getStatusVariant(appointment.status)} className="align-self-start">
              {appointment.status?.[0].toUpperCase() + appointment.status?.slice(1)}
            </Badge>
          </Stack>
        ) : (
          <div className="text-center text-muted py-4">
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>{icon}</div>
            <p>{emptyMessage}</p>
            {emptyAction && (
              <Button {...emptyAction.buttonProps}>{emptyAction.label}</Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AppointmentCard;
