import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import PatientDetails from "./SinglePatientView/PatientDetails";
import MedicalHistoryTable from "./SinglePatientView/MedicalHistoryTable";
import PrescriptionModal from "./SinglePatientView/PrescriptionModal";

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
      <PatientDetails patient={patient} />

      <h4>Medical History</h4>
      <MedicalHistoryTable
        history={history}
        onAddPrescriptionClick={setShowPrescriptionModal}
      />
      <PrescriptionModal
        show={!!showPrescriptionModal}
        onHide={() => setShowPrescriptionModal(null)}
        prescriptionData={prescriptionData}
        setPrescriptionData={setPrescriptionData}
        onSave={() => handlePrescriptionSubmit(showPrescriptionModal)}
      />
    </div>
  );
};

export default SinglePatientView;
