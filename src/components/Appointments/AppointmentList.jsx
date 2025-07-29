import React from 'react';
import { ListGroup, Badge, Button, } from 'react-bootstrap';
import LoadingSpinner from '../Common/LoadingSpinner';

const AppointmentList = ({ appointments, loading, role, onStatusUpdate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center p-3">
        <LoadingSpinner message="Loading appointments..." centered={false} />
      </div>
    );
  }

  if (!appointments ||appointments.length === 0) {
    return (
      <div className="text-center p-3 text-muted">
       <div className="mb-2">📅</div> 
        <div>No appointments found</div>
        {role === 'patient' && (
          <small>Click "Book New Appointment" to schedule your first appointment</small>
        )}
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {appointments.map((appointment) => (
        <ListGroup.Item key={appointment.id} className="px-0">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <h6 className="mb-1">
                {role === 'doctor' 
                  ? `Patient: ${appointment.patientName || 'Unknown'}`
                  : `Dr. ${appointment.doctorName || 'Unknown'}`
                }
              </h6>
              <p className="mb-1 small text-muted">
                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
              </p>
              {appointment.reason && (
                <p className="mb-1 small">
                  <strong>Reason:</strong> {appointment.reason}
                </p>
              )}
              <Badge bg={getStatusColor(appointment.status)}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
            
            {role === 'doctor' && appointment.status === 'pending' && (
              <div className="ms-2">
                <Button 
                  size="sm" 
                  variant="success" 
                  className="me-1"
                  onClick={() => onStatusUpdate(appointment.id, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button 
                  size="sm" 
                  variant="danger"
                  onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                >
                  Cancel
                </Button>
              </div>
            )}
            
            {role === 'doctor' && appointment.status === 'confirmed' && (
              <Button 
                size="sm" 
                variant="info"
                onClick={() => onStatusUpdate(appointment.id, 'completed')}
              >
                Complete
              </Button>
            )}
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default AppointmentList;