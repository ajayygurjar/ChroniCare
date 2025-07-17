
import { Table } from 'react-bootstrap';
import PrescriptionForm from './Prescriptionform';

const HistoryTable = ({
  history,
  isDoctor,
  prescriptionForm,
  setPrescriptionForm,
  handlePrescriptionSubmit,
}) => (
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
      {history.map((item) => (
        <tr key={item.id}>
          <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
          <td>{item.diagnosis}</td>
          <td>{item.notes}</td>
          <td>{item.fileUrl ? <a href={item.fileUrl}>View</a> : 'No File'}</td>
          <td>
            {item.prescription ? (
              <div>
                <strong>Drug:</strong> {item.prescription.drug}<br />
                <strong>Time:</strong> {item.prescription.time}<br />
                <strong>Meal:</strong> {item.prescription.meal}<br />
                <strong>Prescribed By:</strong> {item.prescription.prescribedBy || 'N/A'}<br />
                <small>
                  Added on: {item.prescription.addedAt
                    ? new Date(item.prescription.addedAt).toLocaleString()
                    : 'N/A'}
                </small>
              </div>
            ) : isDoctor ? (
              <PrescriptionForm
                itemId={item.id}
                value={prescriptionForm[item.id] || {}}
                setValue={(val) =>
                  setPrescriptionForm((prev) => ({ ...prev, [item.id]: val }))
                }
                onSubmit={(e) => handlePrescriptionSubmit(e, item.id)}
              />
            ) : (
              'No Prescription'
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default HistoryTable;
