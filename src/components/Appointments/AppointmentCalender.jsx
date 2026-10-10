import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { toLocalISODate, isSameDay } from '../../../utils/format';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOT_TONE = { confirmed: 'ok', pending: 'wait', completed: 'done' };

const AppointmentCalendar = ({ appointments, selectedDate, onDateSelect }) => {
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());

  // "YYYY-MM-DD" -> appointments on that day
  const byDay = useMemo(() => {
    const map = {};
    appointments.forEach((app) => {
      (map[app.date] ||= []).push(app);
    });
    return map;
  }, [appointments]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const today = new Date();

  const goToMonth = (offset) => setViewDate(new Date(year, month + offset, 1));

  const goToToday = () => {
    setViewDate(today);
    onDateSelect(today);
  };

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(<div key={`empty-${i}`} className="cc-day empty" aria-hidden="true" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayAppointments = byDay[toLocalISODate(date)] || [];
    const tones = [...new Set(dayAppointments.map((a) => DOT_TONE[a.status]).filter(Boolean))];
    const isSelected = isSameDay(date, selectedDate);
    const label = `${date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}${
      dayAppointments.length
        ? `, ${dayAppointments.length} ${dayAppointments.length === 1 ? 'appointment' : 'appointments'}`
        : ''
    }`;

    cells.push(
      <button
        type="button"
        key={day}
        className={`cc-day${isSameDay(date, today) ? ' today' : ''}${isSelected ? ' sel' : ''}`}
        onClick={() => onDateSelect(date)}
        aria-pressed={isSelected}
        aria-label={label}
      >
        {day}
        <span className="cc-dots" aria-hidden="true">
          {tones.map((tone) => (
            <i key={tone} className={tone} />
          ))}
        </span>
      </button>
    );
  }

  return (
    <div>
      <div className="cc-cal-head">
        <h2>{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <div className="cc-cal-nav">
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
          <button type="button" className="cc-icon-btn" onClick={() => goToMonth(-1)} aria-label="Previous month">
            <LuChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="cc-icon-btn" onClick={() => goToMonth(1)} aria-label="Next month">
            <LuChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="cc-cal">
        {WEEKDAYS.map((day) => (
          <div key={day} className="cc-wk">
            {day}
          </div>
        ))}
        {cells}
      </div>

      <div className="cc-legend">
        <span><i style={{ background: 'var(--cc-ok-dot)' }} />Confirmed</span>
        <span><i style={{ background: 'var(--cc-wait-dot)' }} />Pending</span>
        <span><i style={{ background: 'var(--cc-done-dot)' }} />Completed</span>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
