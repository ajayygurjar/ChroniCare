import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';

const QuickActionsCard = ({ actions = [], title = "Quick Actions" }) => (
  <Card className="shadow-sm">
    <Card.Header className="bg-light">
      <h5 className="mb-0">
        <span className="me-2">🚀</span>{title}
      </h5>
    </Card.Header>
    <Card.Body>
      <Row>
        {actions.map(({ icon, label, buttonProps = {} }, i) => (
          <Col key={i} sm={6} md={3} className="mb-3">
            <Button
              {...buttonProps}
              className={`w-100 d-flex flex-column align-items-center py-3 ${buttonProps.className || ''}`}
              style={{ minHeight: 80 }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
              <small>{label}</small>
            </Button>
          </Col>
        ))}
      </Row>
    </Card.Body>
  </Card>
);

export default QuickActionsCard;
