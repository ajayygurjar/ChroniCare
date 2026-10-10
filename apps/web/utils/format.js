// Appointment dates are stored as local calendar days ("YYYY-MM-DD", from <input type="date">)
// and times as "HH:MM". Never run them through toISOString(): that converts to UTC and shifts
// the day backwards in any timezone ahead of UTC (e.g. IST).

export const toLocalISODate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// "YYYY-MM-DD" (or a full ISO string) -> Date at local midnight of that calendar day.
export const parseLocalDate = (value) => {
  if (!value) return null;
  const [y, m, d] = String(value).split("T")[0].split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

// Start of an appointment as a local Date, using its time when present.
export const appointmentStart = (appointment) => {
  const day = parseLocalDate(appointment?.date);
  if (!day) return null;
  const [h, min] = String(appointment.time || "00:00").split(":").map(Number);
  day.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(min) ? min : 0, 0, 0);
  return day;
};

export const isSameDay = (a, b) =>
  !!a && !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// "14:30" -> "2:30 PM"
export const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = String(time).split(":").map(Number);
  if (!Number.isFinite(h)) return String(time);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${suffix}`;
};

export const formatLongDate = (date) =>
  date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

export const formatShortDate = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

export const greeting = (now = new Date()) => {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const initials = (name = "") => {
  const parts = String(name).replace(/^Dr\.?\s+/i, "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const fullName = (person) =>
  person ? [person.firstName, person.lastName].filter(Boolean).join(" ") : "";

// Name as shown in the UI: doctors get a "Dr." prefix.
export const displayName = (person, role) => {
  const name = fullName(person);
  if (!name) return "";
  return role === "doctor" ? `Dr. ${name}` : name;
};

// The other party in an appointment, from the viewer's point of view.
export const counterpartName = (appointment, role) => {
  if (role === "doctor") return appointment.patientName || "Unknown patient";
  return appointment.doctorName ? `Dr. ${appointment.doctorName}` : "Unknown doctor";
};

export const STATUS = {
  confirmed: { label: "Confirmed", tone: "ok" },
  pending: { label: "Pending", tone: "wait" },
  cancelled: { label: "Cancelled", tone: "no" },
  completed: { label: "Completed", tone: "done" },
};

export const statusMeta = (status) =>
  STATUS[status] || { label: status ? status[0].toUpperCase() + status.slice(1) : "Unknown", tone: "neutral" };

// Firebase Auth returns upper-case codes ("EMAIL_EXISTS", "WEAK_PASSWORD : Password should be …").
export const friendlyAuthError = (message) => {
  if (!message) return "";
  const code = String(message).split(":")[0].trim();
  const known = {
    EMAIL_EXISTS: "An account with this email already exists. Try logging in instead.",
    INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect.",
    INVALID_PASSWORD: "Email or password is incorrect.",
    EMAIL_NOT_FOUND: "Email or password is incorrect.",
    INVALID_EMAIL: "Enter a valid email address.",
    WEAK_PASSWORD: "Choose a password with at least 6 characters.",
    USER_DISABLED: "This account has been disabled.",
    TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Wait a few minutes and try again.",
  };
  return known[code] || message;
};
