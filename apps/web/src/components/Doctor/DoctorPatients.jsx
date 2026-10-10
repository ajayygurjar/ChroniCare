import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LuSearch, LuChevronRight, LuUsers } from "react-icons/lu";
import { fetchAllPatients } from "../../../store/doctorSlice";
import PageHeader from "../Common/PageHeader";
import Avatar from "../Common/Avatar";
import EmptyState from "../Common/EmptyState";
import LoadingSpinner from "../Common/LoadingSpinner";
import { fullName } from "../../../utils/format";

const DoctorPatients = () => {
  const dispatch = useDispatch();
  const { patients, loading } = useSelector((state) => state.doctor);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllPatients());
  }, [dispatch]);

  const query = searchTerm.trim().toLowerCase();
  const filtered = patients.filter(
    (p) =>
      fullName(p).toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query) ||
      p.age?.toString().includes(query)
  );

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} ${patients.length === 1 ? "patient" : "patients"}`}
      />

      <div className="cc-search">
        <LuSearch aria-hidden="true" />
        <input
          type="search"
          className="form-control"
          placeholder="Search by name, address or age"
          aria-label="Search patients"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="cc-card" style={{ paddingTop: 6, paddingBottom: 6 }}>
        {loading && patients.length === 0 ? (
          <LoadingSpinner message="Loading patients..." />
        ) : filtered.length > 0 ? (
          <ul className="cc-list">
            {filtered.map((p) => (
              <li key={p.id}>
                <Link to={`/doctor/patient/${p.id}`} className="cc-li">
                  <Avatar name={fullName(p)} />
                  <div className="cc-li-body">
                    <span className="cc-li-title">{fullName(p)}</span>
                    <div className="cc-sub">
                      {[p.age, p.gender, p.address].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <LuChevronRight className="cc-chev" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={LuUsers} message="No matching patients found." />
        )}
      </div>
    </>
  );
};

export default DoctorPatients;
