import { createElement } from "react";
import { NavLink } from "react-router-dom";
import { navItems } from "./navItems";
import Avatar from "../Common/Avatar";
import { displayName } from "../../../utils/format";

// Desktop sidebar. Below 768px it is hidden and TabBar takes over.
const Sidebar = ({ role, profile }) => {
  const name = displayName(profile, role);

  return (
    <aside className="cc-side" aria-label="Main navigation">
      {navItems[role]?.map(({ label, path, icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `cc-nav${isActive ? " active" : ""}`}
        >
          {createElement(icon, { "aria-hidden": true })}
          {label}
        </NavLink>
      ))}

      <div className="cc-spacer" />

      <div className="cc-me">
        <Avatar name={name || role} />
        <div style={{ minWidth: 0 }}>
          <b>{name || "Loading…"}</b>
          <small>
            {role === "doctor"
              ? profile?.speciality || "Doctor"
              : "Patient"}
          </small>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
