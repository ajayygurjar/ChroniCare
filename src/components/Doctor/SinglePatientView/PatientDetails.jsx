import React from "react";
import Avatar from "../../Common/Avatar";
import { fullName } from "../../../../utils/format";

const PatientDetails = ({ patient }) => {
  const name = fullName(patient);

  return (
    <div className="cc-card mb-4">
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <Avatar name={name} size="lg" />
        <div className="cc-li-body">
          <h1 style={{ margin: 0 }}>{name}</h1>
          <p className="cc-sub mb-0">
            {[patient.age && `${patient.age} years`, patient.gender].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <dl className="cc-kv mt-3 pt-3" style={{ borderTop: "1px solid var(--cc-line)" }}>
        <dt>Email</dt>
        <dd className={patient.email ? "" : "empty"}>{patient.email || "Not provided"}</dd>
        <dt>Phone</dt>
        <dd className={patient.phone ? "" : "empty"}>{patient.phone || "Not provided"}</dd>
        <dt>Address</dt>
        <dd className={patient.address ? "" : "empty"}>{patient.address || "Not provided"}</dd>
      </dl>
    </div>
  );
};

export default PatientDetails;
