
import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const StatsSection = ({ stats }) => (
  <Container className="py-5">
    <Row className="text-center">
      {stats.map((stat, index) => (
        <Col lg={3} md={6} className="mb-4" key={index}>
          <div className="p-4">
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{stat.icon}</div>
            <h2 className="display-5 fw-bold text-primary mb-2">{stat.number}</h2>
            <p className="text-muted fw-medium">{stat.label}</p>
          </div>
        </Col>
      ))}
    </Row>
  </Container>
);

export default StatsSection;
