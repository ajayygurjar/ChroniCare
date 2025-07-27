import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({ icon, value, label, color = 'primary', className = '' }) => (
  <Card className={`text-center h-100 shadow-sm ${className}`}>
    <Card.Body className="d-flex flex-column justify-content-center">
      {icon && <div className="mb-2" style={{ fontSize: 40 }}>{icon}</div>}
      <h2 className={`text-${color} mb-2`} style={{ fontSize: 40, fontWeight: 'bold' }}>
        {value ?? '--'}
      </h2>
      <p className="mb-0 text-muted">{label}</p>
    </Card.Body>
  </Card>
);

export default StatCard;
 