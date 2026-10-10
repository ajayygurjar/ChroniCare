const ProfileCard = ({ title, profileData, fields = [] }) => (
  <div className="cc-card">
    <div className="cc-eyebrow">{title}</div>
    <dl className="cc-kv">
      {fields.map(({ key, label, transform, fallback }) => {
        const value = transform ? transform(profileData) : profileData[key];
        return (
          <div key={label} style={{ display: 'contents' }}>
            <dt>{label}</dt>
            <dd className={value ? '' : 'empty'}>{value || fallback || 'Not provided'}</dd>
          </div>
        );
      })}
    </dl>
  </div>
);

export default ProfileCard;
