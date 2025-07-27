import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';

export const useProfile = (role) => {
  const { userId } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const collection = role === 'doctor' ? 'doctors' : 'patients';
      const response = await axiosInstance.get(`/${collection}/${userId}.json`);
      setProfile(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const collection = role === 'doctor' ? 'doctors' : 'patients';
      await axiosInstance.patch(`/${collection}/${userId}.json`, updatedData);
      setProfile(prev => ({ ...prev, ...updatedData }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, role]);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
};