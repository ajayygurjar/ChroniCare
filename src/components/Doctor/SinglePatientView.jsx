import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { useSelector } from "react-redux";

const SinglePatientView = () => {
  const { id } = useParams();
  const { userId } = useSelector((state) => state.auth); 

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    drug: "",
    time: "",
    meal: "After Meal",
  });
  const [doctorInfo, setDoctorInfo] = useState({ name: "", address: "" }); 


  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axiosInstance.get(`/users/${id}.json`);
        setPatient(res.data);
      } catch (err) {
        console.error("Failed to load patient info", err);
      }
    };

    const fetchHistory = async () => {
      try {
        const userRes = await axiosInstance.get(`/users/${id}.json`);
        if (!userRes.data || !userRes.data.email) return;

        const cleanEmail = userRes.data.email.replace(/[@.]/g, "");
        const res = await axiosInstance.get(`/history/${cleanEmail}.json`);

        if (res.data) {
          const parsed = Object.entries(res.data).map(([hid, val]) => ({
            id: hid,
            ...val,
          }));
          setHistory(parsed);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };

    const fetchDoctorInfo = async () => {
      try {
        const res = await axiosInstance.get(`/users/${userId}.json`);
        if (res.data) {
          setDoctorInfo({
            name: `${res.data.firstName} ${res.data.lastName}`,
            address: res.data.address,
          });
        }
      } catch (err) {
        console.error("Failed to fetch doctor info", err);
      }
    };

    fetchPatient();
    fetchHistory();
    fetchDoctorInfo(); 
  }, [id, userId]);

  const handlePrescriptionSubmit = async (historyId) => {
    try {
      const cleanEmail = patient.email.replace(/[@.]/g, "");
      await axiosInstance.patch(`/history/${cleanEmail}/${historyId}.json`, {
        prescription: {
          ...prescriptionData,
          addedAt: new Date().toISOString(),
          prescribedBy: `${doctorInfo.name} (${doctorInfo.address})`,
        },
      });
      setShowPrescriptionModal(null);
      setPrescriptionData({ drug: "", time: "", meal: "After Meal" });


      const res = await axiosInstance.get(`/history/${cleanEmail}.json`);
      if (res.data) {
        const parsed = Object.entries(res.data).map(([hid, val]) => ({
          id: hid,
          ...val,
        }));
        setHistory(parsed);
      }
    } catch (err) {
      console.error("Error saving prescription", err);
    }
  };

  if (!patient) return <p>Loading patient details...</p>;

  return (
    <div className="container mt-4">
      <h2>Patient Details</h2>
      <div className="mb-4">
        <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
        <p><strong>Email:</strong> {patient.email}</p>
        <p><strong>Age:</strong> {patient.age}</p>
        <p><strong>Gender:</strong> {patient.gender}</p>
        <p><strong>Address:</strong> {patient.address}</p>
      </div>

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
          {history.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.date).toLocaleDateString()}</td>
              <td>{item.diagnosis}</td>
              <td>{item.notes}</td>
              <td>
                {item.fileUrl ? (
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
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
                    onClick={() => setShowPrescriptionModal(item.id)}
                  >
                    Add Prescription
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        show={!!showPrescriptionModal}
        onHide={() => setShowPrescriptionModal(null)}
      >
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
                onChange={(e) => setPrescriptionData({ ...prescriptionData, drug: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="text"
                placeholder="Morning, Evening..."
                value={prescriptionData.time}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, time: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Meal Time</Form.Label>
              <Form.Select
                value={prescriptionData.meal}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, meal: e.target.value })}
              >
                <option value="After Meal">After Meal</option>
                <option value="Before Meal">Before Meal</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" onClick={() => handlePrescriptionSubmit(showPrescriptionModal)}>
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SinglePatientView;
