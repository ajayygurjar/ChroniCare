import React from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        padding: "1.5rem",
        background: "#f8f9fa",
        borderRight: "1px solid #dee2e6",
      }}
    >
      <h5 className="mb-4">User Panel</h5>

      <Nav className="flex-column">
        <Nav.Link as={Link} to="/dashboard">
          Dashboard
        </Nav.Link>
        <Nav.Link as={Link} to="/section1">
          Section 1
        </Nav.Link>
        <Nav.Link as={Link} to="/section2">
          Section 2
        </Nav.Link>
        <Nav.Link as={Link} to="/profile">
          Section 3
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
