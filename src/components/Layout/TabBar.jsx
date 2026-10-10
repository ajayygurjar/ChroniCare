import { createElement } from "react";
import { NavLink } from "react-router-dom";
import { navItems } from "./navItems";

// Bottom navigation for phones (below 768px). Hidden by CSS on larger screens.
const TabBar = ({ role }) => (
  <nav className="cc-tabbar" aria-label="Main navigation">
    {navItems[role]?.map(({ short, path, icon }) => (
      <NavLink
        key={path}
        to={path}
        className={({ isActive }) => `cc-tab${isActive ? " active" : ""}`}
      >
        {createElement(icon, { "aria-hidden": true })}
        {short}
      </NavLink>
    ))}
  </nav>
);

export default TabBar;
