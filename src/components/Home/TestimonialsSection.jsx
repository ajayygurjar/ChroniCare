
import React from "react";
import { Container, Row, Col, Carousel, Card } from "react-bootstrap";

const TestimonialsSection = ({ testimonials }) => (
  <div style={{ background: "#f8f9fa" }} className="py-5">
    <Container>
      <Row className="text-center mb-5">
        <Col>
          <h2 className="display-4 fw-bold mb-4">What Our Users Say</h2>
          <p className="lead text-muted">Trusted by thousands of patients and healthcare providers</p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Carousel interval={5000} indicators controls>
            {testimonials.map((testimonial, index) => (
              <Carousel.Item key={index}>
                <Card className="border-0 shadow-lg">
                  <Card.Body className="p-5 text-center">
                    <div className="mb-4">{"⭐".repeat(testimonial.rating)}</div>
                    <blockquote className="mb-4">
                      <p className="fs-5 fst-italic">"{testimonial.content}"</p>
                    </blockquote>
                    <div className="d-flex align-items-center justify-content-center">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="rounded-circle me-3"
                        width="60"
                        height="60"
                      />
                      <div className="text-start">
                        <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      </Row>
    </Container>
  </div>
);

export default TestimonialsSection;
