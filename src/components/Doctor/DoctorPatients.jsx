import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPatients } from "../../../store/doctorSlice";
import { useNavigate } from "react-router-dom";

const DoctorPatients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients, loading } = useSelector((state) => state.doctor);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllPatients());
  }, [dispatch]);

  const filtered = patients.filter((p) => {
    const query = searchTerm.toLowerCase();
    return (
      p.firstName?.toLowerCase().includes(query) ||
      p.lastName?.toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query) ||
      p.age?.toString().includes(query)
    );
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Patient List</h2>
      <input
        className="form-control mb-3"
        placeholder="Search by name, address, or age"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length > 0 ? (
        <ul className="list-group">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/doctor/patient/${p.id}`)}
            >
              {p.firstName} {p.lastName} ({p.age} yrs, {p.address})
            </li>
          ))}
        </ul>
      ) : (
        <p>No matching patients found.</p>
      )}
    </div>
  );
};

export default DoctorPatients;
