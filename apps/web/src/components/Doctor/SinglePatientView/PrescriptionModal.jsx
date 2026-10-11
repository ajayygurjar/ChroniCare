import React from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

const PrescriptionModal = ({
  show,
  onHide,
  prescriptionData,
  setPrescriptionData,
  onSave,
  error,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" style={{ fontSize: "1.3125rem" }}>
          Add prescription
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3 mt-2" controlId="rx-drug">
            <Form.Label>Drug name</Form.Label>
            <Form.Control
              type="text"
              value={prescriptionData.drug}
              onChange={(e) =>
                setPrescriptionData({ ...prescriptionData, drug: e.target.value })
              }
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="rx-time">
            <Form.Label>Time</Form.Label>
            <Form.Control
              type="text"
              placeholder="Morning, Evening..."
              value={prescriptionData.time}
              onChange={(e) =>
                setPrescriptionData({ ...prescriptionData, time: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-2" controlId="rx-meal">
            <Form.Label>Meal time</Form.Label>
            <Form.Select
              value={prescriptionData.meal}
              onChange={(e) =>
                setPrescriptionData({ ...prescriptionData, meal: e.target.value })
              }
            >
              <option value="after">After Meal</option>
              <option value="before">Before Meal</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit">Save prescription</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PrescriptionModal;
