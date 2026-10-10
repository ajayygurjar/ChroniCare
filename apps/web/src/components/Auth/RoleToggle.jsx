const ROLES = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
];

// Segmented control used on both the login and sign-up forms.
const RoleToggle = ({ value, onChange }) => (
  <div className="cc-seg" role="radiogroup" aria-label="I am a">
    {ROLES.map((role) => (
      <button
        type="button"
        key={role.value}
        role="radio"
        aria-checked={value === role.value}
        className={value === role.value ? "on" : ""}
        onClick={() => onChange(role.value)}
      >
        {role.label}
      </button>
    ))}
  </div>
);

export default RoleToggle;
