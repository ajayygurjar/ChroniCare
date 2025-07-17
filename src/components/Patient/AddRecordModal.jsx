
import { Modal, Form, Button } from 'react-bootstrap';

const AddRecordModal = ({ show, onHide, formData, setFormData, handleSubmit, handleFileChange }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Add Diagnosis Record</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Diagnosis</Form.Label>
          <Form.Control
            type="text"
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Upload Report (optional)</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
        <Button type="submit">Save Record</Button>
      </Form>
    </Modal.Body>
  </Modal>
);

export default AddRecordModal;
