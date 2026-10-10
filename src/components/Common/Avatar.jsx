import { initials } from '../../../utils/format';

// Initials in a tinted circle. Rendered locally so no user data leaves the app.
const Avatar = ({ name, size, className = '' }) => (
  <span
    className={`cc-avatar ${size || ''} ${className}`.trim()}
    aria-hidden="true"
  >
    {initials(name)}
  </span>
);

export default Avatar;
