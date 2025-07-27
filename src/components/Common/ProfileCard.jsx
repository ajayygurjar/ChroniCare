import React from "react";
import { Card, Button, Row, Col } from "react-bootstrap";

const ProfileCard = ({ title, profileData, onEdit, fields = [], icon = "👤" }) => (
  <Card className="h-100 shadow-sm">
    <Card.Header className="d-flex justify-content-between align-items-center bg-light">
      <h5 className="mb-0">
        <span className="me-2">{icon}</span>
        {title}
      </h5>
      {onEdit && (
        <Button variant="outline-primary" size="sm" onClick={onEdit}>
          <span className="me-1">✏️</span>Edit
        </Button>
      )}
    </Card.Header>
    <Card.Body>
      {fields.map(({ key, label, transform, fallback }, i) => {
        const value = transform ? transform(profileData) : profileData[key];
        const display = value || fallback || "Not provided";
        const isEmpty = !value;

        return (
          <Row key={i} className={`mb-${i === fields.length - 1 ? "0" : "2"}`}>
            <Col xs={4}><strong>{label}:</strong></Col>
            <Col xs={8} className={isEmpty ? "text-muted" : ""}>{display}</Col>
          </Row>
        );
      })}
    </Card.Body>
  </Card>
);

export default ProfileCard;
