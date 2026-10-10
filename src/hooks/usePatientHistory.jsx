import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utils/axiosInstance';

// Medical-history records for one patient, newest first.
export const usePatientHistory = (patientId) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(!!patientId);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await axiosInstance.get(`/history/${patientId}.json`);
      const records = res.data
        ? Object.entries(res.data).map(([id, val]) => ({ id, ...val }))
        : [];
      records.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setHistory(records);
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { history, loading, error, refetch };
};
