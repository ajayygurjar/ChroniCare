import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const PrescriptionModal = ({
  show,
  onHide,
  prescriptionData,
  setPrescriptionData,
  onSave,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add Prescription</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Drug Name</Form.Label>
            <Form.Control
              type="text"
              value={prescriptionData.drug}
              onChange={(e) =>
                setPrescriptionData({ ...prescriptionData, drug: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-2">
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
          <Form.Group className="mb-2">
            <Form.Label>Meal Time</Form.Label>
            <Form.Select
              value={prescriptionData.meal}
              onChange={(e) =>
                setPrescriptionData({ ...prescriptionData, meal: e.target.value })
              }
            >
              <option value="After Meal">After Meal</option>
              <option value="Before Meal">Before Meal</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PrescriptionModal;
