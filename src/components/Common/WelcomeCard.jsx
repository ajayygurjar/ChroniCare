import React from 'react';
import { Card } from 'react-bootstrap';

const WelcomeCard = ({ name, subtitle, bgClass = 'bg-primary', icon = '👋' }) => (
  <Card className={`${bgClass} text-white shadow mb-4`}>
    <Card.Body className="py-4">
      <h2 className="mb-2">
        Welcome back, {name}! <span className="ms-2">{icon}</span>
      </h2>
      {subtitle && (
        <p className="mb-0 opacity-75" style={{ fontSize: '1.1rem' }}>
          {subtitle}
        </p>
      )}
    </Card.Body>
  </Card>
);

export default WelcomeCard;
