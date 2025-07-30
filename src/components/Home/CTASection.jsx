
import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const CTASection = () => (
  <div
    style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}
    className="py-5"
  >
    <Container>
      <Row className="text-center">
        <Col>
          <h2 className="display-4 fw-bold mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="lead mb-4">
            Join thousands of patients and healthcare providers who trust ChroniCare
          </p>
           <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
          <Button
            as={Link}
            to="/auth"
            size="lg"
            className="px-5 py-3  w-100 w-md-auto"
            style={{
              background: "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
              borderRadius: "50px",
              fontWeight: "600",
            }}
          >
            Start Your Journey 
          </Button>
          <Button
            variant="outline-light"
            size="lg"
            className="px-5 py-3 w-100 w-md-auto"
            style={{ borderRadius: "50px", fontWeight: "600" }}
          >
            Contact Sales 💬
          </Button>
          </div>
        </Col>
      </Row>
    </Container>
  </div>
);

export default CTASection;
