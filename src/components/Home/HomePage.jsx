import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <Container className="mt-5">
      <h1 className="mb-4">Welcome to ChroniCare</h1>
      <p className="lead">
        ChroniCare is your trusted platform to manage and track patient health records seamlessly.
      </p>

      <div className="mb-5">
        <Link to="/auth">
          <Button variant="primary" size="lg">
             Login
          </Button>
        </Link>
      </div>

      <Row className="g-4" xs={1} md={2} lg={3}>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Patient Records</Card.Title>
              <Card.Text>
                Easily track and update your medical history, appointments, and health data all in one secure place.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Doctor Access</Card.Title>
              <Card.Text>
                Doctors can access your diagnosis details and provide personalized prescriptions to improve your care.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Seamless Communication</Card.Title>
              <Card.Text>
                Stay connected with your healthcare providers through easy-to-use tools that keep you informed.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
