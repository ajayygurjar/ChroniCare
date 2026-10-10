import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { LuCheck } from 'react-icons/lu';
import Avatar from '../Common/Avatar';
import { toLocalISODate, fullName } from '../../../utils/format';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

const QUICK_REASONS = ['Check-up', 'Follow-up', 'Prescription refill', 'Lab results'];

const currentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Date the form opens on: the day picked in the calendar, but never a day that has passed,
// and tomorrow instead of today once today's last slot is gone.
const initialDate = (selectedDate) => {
  const today = toLocalISODate();
  const picked = selectedDate ? toLocalISODate(selectedDate) : today;
  const start = picked >= today ? picked : today;
  if (start === today && currentTime() >= TIME_SLOTS[TIME_SLOTS.length - 1]) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toLocalISODate(tomorrow);
  }
  return start;
};

// Mounted only while the modal is open, so every opening starts from fresh state.
const BookForm = ({ doctors, selectedDate, onBook, onHide }) => {
  const today = toLocalISODate();

  const [form, setForm] = useState(() => ({
    doctorId: '',
    doctorName: '',
    date: initialDate(selectedDate),
    time: '',
    reason: '',
  }));

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const pickDoctor = (doctor) =>
    set({ doctorId: doctor.id, doctorName: fullName(doctor) });

  // Slots earlier than "now" can't be booked for today.
  const nowTime = currentTime();
  const slotPassed = (slot) => form.date === today && slot <= nowTime;

  const ready = form.doctorId && form.date && form.time && form.reason.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ready) onBook({ ...form, reason: form.reason.trim() });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Modal.Body>
        <span className="form-label d-block mt-2">Doctor</span>
        <div role="radiogroup" aria-label="Doctor">
          {doctors.length === 0 && (
            <p className="text-muted">No doctors are registered yet.</p>
          )}
          {doctors.map((doctor) => {
            const selected = form.doctorId === doctor.id;
            return (
              <button
                type="button"
                key={doctor.id}
                role="radio"
                aria-checked={selected}
                className={`cc-docpick${selected ? ' on' : ''}`}
                onClick={() => pickDoctor(doctor)}
              >
                <Avatar name={fullName(doctor)} />
                <span className="cc-li-body">
                  <b className="d-block">Dr. {fullName(doctor)}</b>
                  <span className="cc-sub">
                    {[doctor.speciality, doctor.experience && `${doctor.experience} yrs`]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                {selected && <LuCheck className="tick" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <div className="cc-form-grid">
          <Form.Group controlId="book-date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={form.date}
              min={today}
              onChange={(e) => set({ date: e.target.value, time: '' })}
              required
            />
          </Form.Group>

          <div>
            <span className="form-label d-block">Time</span>
            <div className="cc-slots" role="radiogroup" aria-label="Time">
              {TIME_SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  role="radio"
                  aria-checked={form.time === slot}
                  className={`cc-slot${form.time === slot ? ' on' : ''}`}
                  disabled={slotPassed(slot)}
                  style={slotPassed(slot) ? { opacity: 0.4 } : undefined}
                  onClick={() => set({ time: slot })}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Form.Group className="mt-3 mb-2" controlId="book-reason">
          <Form.Label>Reason for visit</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={form.reason}
            onChange={(e) => set({ reason: e.target.value })}
            placeholder="Briefly describe why you want to see the doctor"
            required
          />
          <div className="cc-quick-row">
            {QUICK_REASONS.map((reason) => (
              <button
                type="button"
                key={reason}
                className="cc-quick"
                onClick={() => set({ reason })}
              >
                {reason}
              </button>
            ))}
          </div>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="ghost" onClick={onHide}>
          Cancel
        </Button>
        <Button type="submit" disabled={!ready}>
          Request appointment
        </Button>
      </Modal.Footer>
    </Form>
  );
};

const BookAppointmentModal = ({ show, onHide, doctors, onBook, selectedDate, patientName }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <div>
        <Modal.Title as="h2" style={{ fontSize: '1.3125rem' }}>
          Book a visit
        </Modal.Title>
        {patientName && <p className="text-muted mb-0 mt-1" style={{ fontSize: 14 }}>Booking as {patientName}</p>}
      </div>
    </Modal.Header>
    <BookForm
      doctors={doctors}
      selectedDate={selectedDate}
      onBook={onBook}
      onHide={onHide}
    />
  </Modal>
);

export default BookAppointmentModal;
