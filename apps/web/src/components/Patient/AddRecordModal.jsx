import { Modal, Form, Button, Alert } from "react-bootstrap";

const AddRecordModal = ({
  show,
  onHide,
  formData,
  setFormData,
  handleSubmit,
  saving,
  error,
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title as="h2" style={{ fontSize: "1.3125rem" }}>
        Add record
      </Modal.Title>
    </Modal.Header>
    <Form onSubmit={handleSubmit}>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3 mt-2" controlId="record-diagnosis">
          <Form.Label>Diagnosis</Form.Label>
          <Form.Control
            type="text"
            value={formData.diagnosis}
            onChange={(e) =>
              setFormData({ ...formData, diagnosis: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="record-notes">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            required
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="ghost" onClick={onHide}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save record"}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);

export default AddRecordModal;
