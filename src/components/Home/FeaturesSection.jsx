
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const FeaturesSection = ({ features }) => (
  <Container className="py-5">
    <Row className="text-center mb-5">
      <Col>
        <h2 className="display-4 fw-bold mb-4" style={{ color: "#333" }}>
          Powerful Features for Better Healthcare
        </h2>
        <p className="lead text-muted">
          Discover how ChroniCare transforms healthcare management with cutting-edge technology
        </p>
      </Col>
    </Row>

    <Row className="g-4">
      {features.map((feature, index) => (
        <Col lg={4} md={6} key={index}>
          <Card
            className="h-100 border-0 shadow-sm"
            style={{ cursor: "pointer", transition: "all 0.3s ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
            }}
          >
            <Card.Body className="p-4 text-center">
              <div
                className="rounded-3 mb-4 mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  background: feature.gradient,
                  fontSize: "2rem",
                }}
              >
                {feature.icon}
              </div>
              <h5 className="fw-bold mb-3">{feature.title}</h5>
              <p className="text-muted">{feature.description}</p>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Container>
);

export default FeaturesSection;
