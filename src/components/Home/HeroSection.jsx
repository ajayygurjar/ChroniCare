
import React from "react";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const HeroSection = ({ onWatchDemo, stats }) => (
  <div style={{
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  }}>
    
    <div style={{
      position: "absolute", top: "10%", right: "10%",
      width: "200px", height: "200px",
      background: "rgba(255,255,255,0.1)", borderRadius: "50%",
      animation: "float 6s ease-in-out infinite"
    }} />
    <div style={{
      position: "absolute", bottom: "15%", left: "5%",
      width: "150px", height: "150px",
      background: "rgba(255,255,255,0.05)", borderRadius: "50%",
      animation: "float 8s ease-in-out infinite reverse"
    }} />

    <Container>
      <Row className="align-items-center min-vh-100">
        <Col lg={6} className="text-white">
          <h1 className="display-3 fw-bold mb-4">
            Your Health, <span style={{ color: "#fed6e3" }}>Simplified</span>
          </h1>
          <p className="lead mb-4 fs-4">
            ChroniCare is your trusted platform to manage and track patient health records seamlessly.
          </p>
          <div className="d-flex flex-column flex-md-row gap-3 mb-5">
            <Button
              as={Link}
              to="/auth"
              size="lg"
              style={{
                background: "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
                border: "none", borderRadius: "50px", fontWeight: "600",
                boxShadow: "0 10px 30px rgba(240, 147, 251, 0.4)"
              }}
            >
              Get Started Free 
            </Button>
            <Button
              variant="outline-light"
              size="lg"
              style={{ borderRadius: "50px", fontWeight: "600" }}
              onClick={onWatchDemo}
            >
              📹 Watch Demo
            </Button>
          </div>
          
          <Row className="text-center text-lg-start">
            {stats.slice(0, 2).map((stat, index) => (
              <Col xs={6} key={index} className="mb-3">
                <div className="d-flex align-items-center justify-content-center justify-content-lg-start">
                  <span style={{ fontSize: "2rem", marginRight: "10px" }}>{stat.icon}</span>
                  <div>
                    <h3 className="mb-0 fw-bold">{stat.number}</h3>
                    <small className="text-white-50">{stat.label}</small>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
        <Col lg={6} className="text-center">
          
          <Card
            className="shadow-lg border-0"
            style={{
              transform: "rotate(5deg)",
              transition: "transform 0.3s ease",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "rotate(0deg)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "rotate(5deg)"}
          >
            <Card.Header className="bg-transparent border-0 py-4">
              <div className="d-flex justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "50px", height: "50px",
                      background: "linear-gradient(45deg, #667eea, #764ba2)",
                      color: "white", fontSize: "1.5rem"
                    }}>❤️</div>
                  <div>
                    <h5 className="mb-0 text-dark">Health Dashboard</h5>
                    <small className="text-muted">Real-time insights</small>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="rounded-circle me-1" style={{ width: "12px", height: "12px", background: "#ff5f57" }}></div>
                  <div className="rounded-circle me-1" style={{ width: "12px", height: "12px", background: "#ffbd2e" }}></div>
                  <div className="rounded-circle" style={{ width: "12px", height: "12px", background: "#28ca42" }}></div>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-3 p-3 rounded" style={{ background: "#d4edda" }}>
                <div className="d-flex justify-content-between">
                  <span>✅ Blood Pressure: Normal</span>
                  <Badge bg="success">120/80</Badge>
                </div>
              </div>
              <div className="mb-3 p-3 rounded" style={{ background: "#cce5ff" }}>
                <div className="d-flex justify-content-between">
                  <span>💓 Heart Rate</span>
                  <Badge bg="primary">72 BPM</Badge>
                </div>
              </div>
              <div className="p-3 rounded" style={{ background: "#f3e5f5" }}>
                <div className="d-flex justify-content-between">
                  <span>🩺 Next Appointment</span>
                  <Badge bg="secondary">Tomorrow</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
    `}</style>
  </div>
);

export default HeroSection;
