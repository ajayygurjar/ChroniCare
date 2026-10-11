import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { LuChevronLeft, LuFileText } from "react-icons/lu";
import api, { apiErrorMessage } from "../../../utils/axiosInstance";
import PatientDetails from "./SinglePatientView/PatientDetails";
import PrescriptionModal from "./SinglePatientView/PrescriptionModal";
import RecordCard from "../Common/RecordCard";
import EmptyState from "../Common/EmptyState";
import LoadingSpinner from "../Common/LoadingSpinner";
import { usePatientHistory } from "../../hooks/usePatientHistory";

const emptyPrescription = { drug: "", time: "", meal: "after" };

const SinglePatientView = () => {
  const { id } = useParams();
  const { history, error: historyError, refetch } = usePatientHistory(id);

  const [patient, setPatient] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState(emptyPrescription);
  const [saveError, setSaveError] = useState(null);

  // The API only returns a patient to a doctor who has an appointment with them.
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data } = await api.get(`/patients/${id}`);
        setPatient(data.patient);
        setLoadError(null);
      } catch (err) {
        setLoadError(apiErrorMessage(err, "Could not load this patient."));
      }
    };
    fetchPatient();
  }, [id]);

  const openPrescriptionModal = (historyId) => {
    setSaveError(null);
    setPrescriptionData(emptyPrescription);
    setShowPrescriptionModal(historyId);
  };

  const handlePrescriptionSubmit = async (historyId) => {
    try {
      await api.post(`/history/${historyId}/prescription`, prescriptionData);
      setShowPrescriptionModal(null);
      setPrescriptionData(emptyPrescription);
      refetch();
    } catch (err) {
      setSaveError(apiErrorMessage(err, "Could not save the prescription."));
    }
  };

  if (loadError) {
    return (
      <>
        <Link to="/doctor/patients" className="cc-link d-inline-flex align-items-center gap-1 mb-3">
          <LuChevronLeft aria-hidden="true" /> All patients
        </Link>
        <Alert variant="danger">{loadError}</Alert>
      </>
    );
  }

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

      {historyError && <Alert variant="danger">{historyError}</Alert>}

      {history.length > 0 ? (
        <div className="cc-stack mt-2">
          {history.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onAddPrescription={openPrescriptionModal}
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
        error={saveError}
      />
    </>
  );
};

export default SinglePatientView;
