import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import AddRecordModal from "./AddRecordModal";
import HistoryTable from "./HistoryTable";


const PatientHistory = ({ viewUserId }) => {
  const { userId } = useSelector((state) => state.auth);
  const isDoctor = !!viewUserId;

  const currentUserId = isDoctor ? viewUserId : userId;

  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ diagnosis: "", notes: "" });
  const [prescriptionForm, setPrescriptionForm] = useState({});
  const [doctorInfo, setDoctorInfo] = useState({});

  const fetchHistory = async () => {
    try {
        

      const res = await axiosInstance.get(`/history/${currentUserId}.json`);
      if (res.data) {
        const parsed = Object.entries(res.data).map(([id, val]) => ({
          id,
          ...val,
        }));
        setHistory(parsed);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const fetchDoctorInfo = async () => {
    try {
      const res = await axiosInstance.get(`/doctors/${userId}.json`);
      if (res.data) {
        setDoctorInfo({
          name: `${res.data.firstName} ${res.data.lastName}`,
          address: res.data.address || "",
        });
      }
    } catch (err) {
      console.error("Error fetching doctor info", err);
    }
  };

  useEffect(() => {
    if (currentUserId) fetchHistory();
    if (isDoctor) fetchDoctorInfo();
  }, [currentUserId, isDoctor,userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserId) return;

    const newHistory = {
      diagnosis: formData.diagnosis,
      notes: formData.notes,
      date: new Date().toISOString(),
    };
    await axiosInstance.post(`/history/${currentUserId}.json`, newHistory);

    setFormData({ diagnosis: "", notes: "", file: null });
    setShowModal(false);
    fetchHistory();
  };
  const handlePrescriptionSubmit = async (e, itemId) => {
    e.preventDefault();
    const item = prescriptionForm[itemId];
    if (!item) return;

    await axiosInstance.patch(`/history/${viewUserId}/${itemId}.json`, {
      prescription: {
        drug: item.drug,
        time: item.time,
        meal: item.meal,
        addedAt: new Date().toISOString(),
        prescribedBy: `${doctorInfo.name} (${doctorInfo.address})`,
      },
    });

    fetchHistory();
  };

  return (
    <div className="container mt-4">
      {!isDoctor && (
        <Button className="mb-3" onClick={() => setShowModal(true)}>
          Add New Record
        </Button>
      )}

      <h4>Medical History</h4>

      <HistoryTable
        history={history}
        isDoctor={isDoctor}
        prescriptionForm={prescriptionForm}
        setPrescriptionForm={setPrescriptionForm}
        handlePrescriptionSubmit={handlePrescriptionSubmit}
      />

      {!isDoctor && (
        <AddRecordModal
          show={showModal}
          onHide={() => setShowModal(false)}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default PatientHistory;
