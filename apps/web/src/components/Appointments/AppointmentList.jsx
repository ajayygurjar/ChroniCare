import React from 'react';
import { Button } from 'react-bootstrap';
import StatusChip from '../Common/StatusChip';
import { parseLocalDate, formatTime, counterpartName } from '../../../utils/format';

// Rows for a set of appointments. showDate=true puts the calendar day in the left tile
// (for multi-day lists); false puts the time there (for a single selected day).
const AppointmentList = ({ appointments, role, onStatusUpdate, showDate = true }) => (
  <ul className="cc-list">
    {appointments.map((appointment) => {
      const day = parseLocalDate(appointment.date);
      const [clock, meridiem] = formatTime(appointment.time).split(' ');

      return (
        <li key={appointment.id} className="cc-li wrap">
          <div className="cc-when">
            {showDate && day ? (
              <>
                <b>{String(day.getDate()).padStart(2, '0')}</b>
                <span>{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </>
            ) : (
              <>
                <b>{clock || '--'}</b>
                <span>{meridiem || ''}</span>
              </>
            )}
          </div>

          <div className="cc-li-body">
            <span className="cc-li-title">{counterpartName(appointment, role)}</span>
            <div className="cc-sub">
              {[showDate && appointment.time && formatTime(appointment.time), appointment.reason]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>

          <StatusChip status={appointment.status} />

          {role === 'doctor' && appointment.status === 'pending' && (
            <div className="cc-li-actions below">
              <Button size="sm" variant="ghost-danger" onClick={() => onStatusUpdate(appointment.id, 'cancelled')}>
                Decline
              </Button>
              <Button size="sm" onClick={() => onStatusUpdate(appointment.id, 'confirmed')}>
                Confirm
              </Button>
            </div>
          )}

          {role === 'doctor' && appointment.status === 'confirmed' && (
            <div className="cc-li-actions below">
              <Button size="sm" onClick={() => onStatusUpdate(appointment.id, 'completed')}>
                Mark complete
              </Button>
            </div>
          )}
        </li>
      );
    })}
  </ul>
);

export default AppointmentList;
