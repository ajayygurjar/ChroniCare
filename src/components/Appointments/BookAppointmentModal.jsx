import React, { useState,useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const BookAppointmentModal = ({ show, onHide, doctors, onBook,selectedDate }) => {
  const [formData, setFormData] = useState({
    doctorId: '',
    doctorName: '',
    date: '',
    time: '',
    reason: '',
    patientName: ''
  });
 useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0]
      }));
    }
  }, [selectedDate]);
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'doctorId') {
      const selectedDoctor = doctors.find(doc => doc.id === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        doctorName: selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.doctorId && formData.date && formData.time && formData.reason && formData.patientName) {
      onBook(formData);
      setFormData({
        doctorId: '',
        doctorName: '',
        date: '',
        time: '',
        reason: '',
        patientName: ''
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Book New Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Patient Name *</Form.Label>
            <Form.Control
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Select Doctor *</Form.Label>
            <Form.Select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              required
            >
              <option value="">Choose a doctor...</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Appointment Date *</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Preferred Time *</Form.Label>
            <Form.Select
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            >
              <option value="">Select time...</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason for Visit *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Please describe the reason for your visit..."
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Book Appointment
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
export default BookAppointmentModal;