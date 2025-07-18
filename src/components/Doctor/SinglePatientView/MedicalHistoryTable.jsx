import React from "react";
import { Table, Button } from "react-bootstrap";

const MedicalHistoryTable = ({ history, onAddPrescriptionClick }) => {
  return (
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
            <td>{new Date(item.date).toLocaleDateString()}</td>
            <td>{item.diagnosis}</td>
            <td>{item.notes}</td>
            <td>
              {item.fileUrl ? (
                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              ) : (
                "No File"
              )}
            </td>
            <td>
              {item.prescription ? (
                <div>
                  <strong>Drug:</strong> {item.prescription.drug} <br />
                  <strong>Time:</strong> {item.prescription.time} <br />
                  <strong>Meal:</strong> {item.prescription.meal} <br />
                  <strong>Prescribed By:</strong> {item.prescription.prescribedBy || "Unknown"} <br />
                  <strong>Added On:</strong>{" "}
                  {item.prescription.addedAt
                    ? new Date(item.prescription.addedAt).toLocaleString()
                    : "N/A"}
                </div>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onAddPrescriptionClick(item.id)}
                >
                  Add Prescription
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default MedicalHistoryTable;
