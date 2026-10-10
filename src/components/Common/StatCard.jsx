const StatCard = ({ icon: Icon, value, label }) => (
  <div className="cc-card cc-stat">
    {Icon && (
      <span className="cc-stat-icon" aria-hidden="true">
        <Icon />
      </span>
    )}
    <div>
      <b>{value ?? '--'}</b>
      <span>{label}</span>
    </div>
  </div>
);

export default StatCard;
