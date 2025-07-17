
import { useState } from 'react';
import { Button, Modal, Form, Table } from 'react-bootstrap';

const staticHistory = [
  {
    id: '1',
    date: '2025-06-01T12:00:00Z',
    diagnosis: 'Hypertension',
    notes: 'Patient advised to reduce salt intake',
    fileUrl: null,
    prescription: {
      drug: 'Lisinopril',
      time: 'Morning',
      meal: 'Before Meal',
      addedAt: '2025-06-01T13:00:00Z',
      prescribedBy: 'Dr. Ajay (Bhopal)',
    },
  },
  {
    id: '2',
    date: '2025-07-15T09:30:00Z',
    diagnosis: 'Diabetes Type 2',
    notes: 'Patient needs regular insulin shots',
    fileUrl: 'https://example.com/report.pdf',
    prescription: null,
  },
];

const PatientHistory = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ diagnosis: '', notes: '', file: null });

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Static form submission: no real save.');
    setFormData({ diagnosis: '', notes: '', file: null });
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Add New Record
      </Button>

      <h4>Medical History</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Diagnosis</th>
            <th>Notes</th>
            <th>Document</th>
            <th>Prescription</th>
          </tr>
        </thead>
        <tbody>
          {staticHistory.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.date).toLocaleDateString()}</td>
              <td>{item.diagnosis}</td>
              <td>{item.notes}</td>
              <td>{item.fileUrl ? <a href={item.fileUrl}>View</a> : 'No File'}</td>
              <td>
                {item.prescription ? (
                  <div>
                    <strong>Drug:</strong> {item.prescription.drug}<br />
                    <strong>Time:</strong> {item.prescription.time}<br />
                    <strong>Meal:</strong> {item.prescription.meal}<br />
                    <strong>Prescribed By:</strong> {item.prescription.prescribedBy}<br />
                    <small>
                      Added on: {new Date(item.prescription.addedAt).toLocaleString()}
                    </small>
                  </div>
                ) : (
                  'No Prescription'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
    </div>
  );
};

export default PatientHistory;
