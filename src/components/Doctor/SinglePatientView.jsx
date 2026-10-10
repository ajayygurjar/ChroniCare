import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LuChevronLeft, LuFileText } from "react-icons/lu";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import PatientDetails from "./SinglePatientView/PatientDetails";
import PrescriptionModal from "./SinglePatientView/PrescriptionModal";
import RecordCard from "../Common/RecordCard";
import EmptyState from "../Common/EmptyState";
import LoadingSpinner from "../Common/LoadingSpinner";
import { usePatientHistory } from "../../hooks/usePatientHistory";

const SinglePatientView = () => {
  const { id } = useParams();
  const { userId } = useSelector((state) => state.auth);
  const { history, refetch } = usePatientHistory(id);

  const [patient, setPatient] = useState(null);
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
        const res = await axiosInstance.get(`/patients/${id}.json`);
        setPatient(res.data);
      } catch (err) {
        console.error("Failed to load patient info", err);
      }
    };

    const fetchDoctorInfo = async () => {
      try {
        const res = await axiosInstance.get(`/doctors/${userId}.json`);
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
    fetchDoctorInfo();
  }, [id, userId]);

  const handlePrescriptionSubmit = async (historyId) => {
    try {
      await axiosInstance.patch(`/history/${id}/${historyId}.json`, {
        prescription: {
          ...prescriptionData,
          addedAt: new Date().toISOString(),
          prescribedBy: `${doctorInfo.name} (${doctorInfo.address})`,
        },
      });
      setShowPrescriptionModal(null);
      setPrescriptionData({ drug: "", time: "", meal: "After Meal" });
      refetch();
    } catch (err) {
      console.error("Error saving prescription", err);
    }
  };

  if (!patient) return <LoadingSpinner message="Loading patient details..." />;

  return (
    <>
      <Link to="/doctor/patients" className="cc-link d-inline-flex align-items-center gap-1 mb-3">
        <LuChevronLeft aria-hidden="true" /> All patients
      </Link>

      <PatientDetails patient={patient} />

      <div className="cc-card-head">
        <h2>Medical history</h2>
        <span className="cc-sub">
          {history.length} {history.length === 1 ? "record" : "records"} · newest first
        </span>
      </div>

      {history.length > 0 ? (
        <div className="cc-stack mt-2">
          {history.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onAddPrescription={setShowPrescriptionModal}
            />
          ))}
        </div>
      ) : (
        <div className="cc-card">
          <EmptyState icon={LuFileText} message="This patient has no records yet" />
        </div>
      )}

      <PrescriptionModal
        show={!!showPrescriptionModal}
        onHide={() => setShowPrescriptionModal(null)}
        prescriptionData={prescriptionData}
        setPrescriptionData={setPrescriptionData}
        onSave={() => handlePrescriptionSubmit(showPrescriptionModal)}
      />
    </>
  );
};

export default SinglePatientView;
