import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatientData } from "../../../store/patientSlice";

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { userId } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.patient);

  useEffect(() => {
    if (userId) dispatch(fetchPatientData(userId));
  }, [dispatch, userId]);

  if (loading) return <p>Loading...</p>;

  if (!profile) return <p>No data available</p>;

  return (
    <div className="container mt-4">
      <h2>Patient Dashboard</h2>
      <div className="card p-3">
        <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Age:</strong> {profile.age}</p>
        <p><strong>Gender:</strong> {profile.gender}</p>
        <p><strong>Address:</strong> {profile.address}</p>
      </div>
    </div>
  );
};

export default PatientDashboard;
