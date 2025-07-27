import React from 'react';
import { Spinner, Container, Stack } from 'react-bootstrap';

const LoadingSpinner = ({
  message = 'Loading...',
  size = 'border',
  variant = 'primary',
  centered = true
}) => {
  const spinner = (
    <Stack className="text-center" gap={2}>
      <Spinner animation={size} variant={variant} role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <div className="text-muted">{message}</div>
    </Stack>
  );

  return centered ? (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '200px' }}
    >
      {spinner}
    </Container>
  ) : spinner;
};

export default LoadingSpinner;
