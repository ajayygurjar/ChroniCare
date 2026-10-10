import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { LuActivity, LuCheck } from "react-icons/lu";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const COPY = {
  login: {
    title: "Welcome back.",
    points: [
      "See your next appointment and latest prescriptions",
      "Add to your medical history any time",
      "Doctors: confirm requests and prescribe in one place",
    ],
  },
  signup: {
    title: "Create your account.",
    points: [
      "Patients: book visits and keep your history in one place",
      "Doctors: review requests and write prescriptions",
      "It takes two short steps",
    ],
  },
};

const AuthPage = () => {
  const { token } = useSelector((state) => state.auth);
  const location = useLocation();
  const [mode, setMode] = useState(location.state?.mode === "signup" ? "signup" : "login");

  if (token) return <Navigate to="/dashboard" replace />;

  const copy = COPY[mode];

  return (
    <div className="cc-split">
      <aside className="cc-pane">
        <Link to="/" className="cc-logo">
          <span className="cc-mark" aria-hidden="true">
            <LuActivity />
          </span>
          ChroniCare
        </Link>
        <div>
          <h1>{copy.title}</h1>
          <ul>
            {copy.points.map((point) => (
              <li key={point}>
                <LuCheck aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <small style={{ opacity: 0.7 }}>© ChroniCare</small>
      </aside>

      <section className="cc-form-side">
        <div className="cc-form-box">
          {mode === "login" ? (
            <LoginForm onSwitch={() => setMode("signup")} />
          ) : (
            <SignupForm onSwitch={() => setMode("login")} />
          )}
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
