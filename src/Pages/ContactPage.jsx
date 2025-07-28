import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowAlert(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4 text-center">
        <Col>
          <h1>📞 Contact Us</h1>
          <p className="text-muted">We’re here to help. Reach out anytime.</p>
        </Col>
      </Row>

      {showAlert && <Alert variant="success">✅ Message sent successfully!</Alert>}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-primary text-white">📧 Get in Touch</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Select name="subject" value={formData.subject} onChange={handleChange} required>
                    <option value="">Select Subject</option>
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Appointment Help</option>
                    <option>Billing</option>
                    <option>Feedback</option>
                    <option>Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100">
                  📤 Send Message
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header className="bg-success text-white">📍 Contact Info</Card.Header>
            <Card.Body>
              <p><strong>ChroniCare Healthcare</strong></p>
              <p>Email: <a href="mailto:support@chronicare.com">support@chronicare.com</a></p>
              <p>Phone: <a href="tel:+1234567890">+1 (234) 567-8900</a></p>
              <p>Address: 123 Healthcare Ave, City, State</p>
              <p>Hours: Mon–Fri 8AM–6PM, Sat 9AM–4PM</p>
            </Card.Body>
          </Card>

          <Card className="mt-3 border-danger">
            <Card.Header className="bg-danger text-white">🚨 Emergency</Card.Header>
            <Card.Body>
              <p>For emergencies, call:</p>
              <h4><a href="tel:911" className="text-danger">911</a></h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;
