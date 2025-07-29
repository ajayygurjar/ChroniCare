import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ role }) => {
  const location = useLocation();

  const menuItems = {
    doctor: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Patients", path: "/doctor/patients" },
      { label: "Appointments", path: "/appointments" },
    ],
    patient: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Medical History", path: "/patient/history" },
      { label: "Appointments", path: "/appointments" },
    ],
  };

  const activeStyle = {
    fontWeight: "bold",
    color: "#0d6efd",
  };
  return (
    <div
      style={{
        width: "220px",
        height: "140vh",
        padding: "1.5rem",
        background: "#f8f9fa",
        borderRight: "3px solid #dee2e6",
      }}
    >
      <h5 className="mb-4" bg='primary'>
        {role === "doctor" ? "Doctor Panel" : "Patient Panel"}
      </h5>

      <Nav className="flex-column">
        {menuItems[role]?.map((item) => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            style={location.pathname === item.path ? activeStyle : {}}
          >
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
