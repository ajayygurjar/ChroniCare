import { useState } from "react";
import { Button } from "react-bootstrap";
import { LuPlus, LuFileText } from "react-icons/lu";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import AddRecordModal from "./AddRecordModal";
import RecordCard from "../Common/RecordCard";
import PageHeader from "../Common/PageHeader";
import EmptyState from "../Common/EmptyState";
import LoadingSpinner from "../Common/LoadingSpinner";
import { usePatientHistory } from "../../hooks/usePatientHistory";

const PatientHistory = () => {
  const { userId } = useSelector((state) => state.auth);
  const { history, loading, refetch } = usePatientHistory(userId);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ diagnosis: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setSaveError(null);
    try {
      await axiosInstance.post(`/history/${userId}.json`, {
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        date: new Date().toISOString(),
      });
      setFormData({ diagnosis: "", notes: "" });
      setShowModal(false);
      refetch();
    } catch (err) {
      console.error("Error saving record:", err);
      setSaveError("Could not save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addButton = (
    <Button onClick={() => setShowModal(true)}>
      <LuPlus aria-hidden="true" /> Add record
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Medical history"
        subtitle={`${history.length} ${history.length === 1 ? "record" : "records"} · newest first`}
        action={addButton}
      />

      {loading ? (
        <LoadingSpinner message="Loading your records..." />
      ) : history.length > 0 ? (
        <div className="cc-stack">
          {history.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="cc-card">
          <EmptyState icon={LuFileText} message="No records yet">
            <Button variant="ghost" size="sm" onClick={() => setShowModal(true)}>
              Add your first record
            </Button>
          </EmptyState>
        </div>
      )}

      <AddRecordModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        saving={saving}
        error={saveError}
      />
    </>
  );
};

export default PatientHistory;
