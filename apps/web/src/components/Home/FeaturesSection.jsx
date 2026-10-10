import React, { createElement } from "react";
import { LuCalendarDays, LuFileText, LuPill } from "react-icons/lu";

const FEATURES = [
  {
    icon: LuCalendarDays,
    title: "Book appointments",
    description:
      "Pick a doctor, a day and a time slot. Track the request until your doctor confirms it.",
  },
  {
    icon: LuFileText,
    title: "Keep your medical history",
    description:
      "Add diagnoses and notes yourself. Your doctor sees the same timeline when they open your record.",
  },
  {
    icon: LuPill,
    title: "See your prescriptions",
    description:
      "Drug, timing and who prescribed it, attached to the visit it came from.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="cc-section">
    <div className="cc-section-head">
      <h2>What you can do</h2>
      <p className="text-muted mb-0">
        ChroniCare keeps the everyday parts of care together, for patients and for the doctors who treat them.
      </p>
    </div>

    <div className="cc-features">
      {FEATURES.map(({ icon, title, description }) => (
        <div className="cc-card cc-feature" key={title}>
          <span className="cc-feature-icon" aria-hidden="true">
            {createElement(icon)}
          </span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
