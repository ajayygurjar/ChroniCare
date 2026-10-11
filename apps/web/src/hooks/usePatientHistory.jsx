import { useState, useEffect, useCallback } from 'react';
import api, { apiErrorMessage } from '../../utils/axiosInstance';

// Medical-history records for one patient, newest first. The API allows it for the patient
// themselves and for a doctor who has an appointment with that patient.
export const usePatientHistory = (patientId) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(!!patientId);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!patientId) return;
    try {
      const { data } = await api.get(`/patients/${patientId}/history`);
      setHistory(data.records);
      setError(null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load the medical history.'));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { history, loading, error, refetch };
};
