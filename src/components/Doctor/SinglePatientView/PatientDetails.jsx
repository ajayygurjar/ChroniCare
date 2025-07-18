import React from "react";

const PatientDetails = ({ patient }) => {
  return (
    <div className="mb-4">
      <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
      <p><strong>Email:</strong> {patient.email}</p>
      <p><strong>Age:</strong> {patient.age}</p>
      <p><strong>Gender:</strong> {patient.gender}</p>
      <p><strong>Address:</strong> {patient.address}</p>
    </div>
  );
};

export default PatientDetails;
