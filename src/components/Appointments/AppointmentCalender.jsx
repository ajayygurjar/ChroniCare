import React, { useState } from 'react';
import { Badge, Button } from 'react-bootstrap';

const AppointmentCalendar = ({ appointments, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

const getAppointmentsForDate = (date) => {
  const dateStr = date.toLocaleDateString('en-CA'); 
  return appointments.filter(app => app.date === dateStr);
};

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onClick={() => onDateSelect(date)}
          style={{ cursor: 'pointer' }}
        >
          <div className="day-number">{day}</div>
          {dayAppointments.length > 0 && (
            <div className="appointments-count">
              <Badge bg="primary" pill>
                {dayAppointments.length}
              </Badge>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="appointment-calendar">
      <style>{`
        .appointment-calendar {
          width: 100%;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #e9ecef;
          border: 1px solid #e9ecef;
        }
        .calendar-day {
          background: white;
          min-height: 60px;
          padding: 4px;
          position: relative;
          border: 1px solid #f8f9fa;
        }
        .calendar-day.empty {
          background: #f8f9fa;
        }
        .calendar-day.today {
          background: #e3f2fd;
          font-weight: bold;
        }
        .calendar-day:hover {
          background: #f0f8ff;
        }
        .day-number {
          font-size: 0.9rem;
        }
        .appointments-count {
          position: absolute;
          bottom: 2px;
          right: 2px;
        }
        .weekday-header {
          background: #6c757d;
          color: white;
          padding: 8px 4px;
          text-align: center;
          font-weight: bold;
          font-size: 0.8rem;
        }
      `}</style>

      <div className="calendar-header">
        <Button variant="outline-secondary" onClick={() => navigateMonth(-1)}>
          ←
        </Button>
        <h5 className="mb-0">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h5>
        <Button variant="outline-secondary" onClick={() => navigateMonth(1)}>
          →
        </Button>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default AppointmentCalendar;