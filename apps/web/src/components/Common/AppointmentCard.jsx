import { LuCalendarDays } from 'react-icons/lu';
import StatusChip from './StatusChip';
import EmptyState from './EmptyState';
import {
  parseLocalDate,
  formatTime,
  counterpartName,
} from '../../../utils/format';

// Highlights one appointment: date block, who, when, why, status.
const AppointmentCard = ({
  title,
  appointment,
  role,
  emptyMessage,
  emptyAction,
  children,
}) => {
  const day = appointment ? parseLocalDate(appointment.date) : null;

  return (
    <div className="cc-card">
      <div className="cc-eyebrow">{title}</div>
      {appointment && day ? (
        <>
          <div className="cc-appt">
            <div className="cc-datebox">
              <b>{day.getDate()}</b>
              <span>
                {day.toLocaleDateString('en-US', { weekday: 'short' })} ·{' '}
                {day.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </div>
            <div className="cc-li-body">
              <h3 style={{ marginBottom: 2 }}>{counterpartName(appointment, role)}</h3>
              <div className="cc-sub">
                {day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {appointment.time && ` · ${formatTime(appointment.time)}`}
              </div>
              {appointment.reason && <div style={{ marginTop: 4 }}>{appointment.reason}</div>}
            </div>
            <StatusChip status={appointment.status} />
          </div>
          {children}
        </>
      ) : (
        <EmptyState icon={LuCalendarDays} message={emptyMessage}>
          {emptyAction}
        </EmptyState>
      )}
    </div>
  );
};

export default AppointmentCard;
