import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LuPlay, LuPill } from "react-icons/lu";

const DEMO_URL = "https://www.loom.com/share/91a6872c5bd64d3ea6c68ea0971aab65";

const HeroSection = () => (
  <section className="cc-hero">
    <div>
      <span className="cc-chip">For patients and doctors</span>
      <h1>Your records, prescriptions and appointments in one calm place.</h1>
      <p className="sub">
        Book visits, keep your medical history, and see what your doctor
        prescribed. Doctors review requests and write prescriptions from the
        same screen.
      </p>
      <div className="cc-hero-actions">
        <Button as={Link} to="/auth" state={{ mode: "signup" }} size="lg">
          Create free account
        </Button>
        <Button
          as="a"
          href={DEMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
          size="lg"
        >
          <LuPlay aria-hidden="true" /> Watch demo
        </Button>
      </div>
    </div>

    <div className="cc-hero-art" aria-hidden="true">
      <div className="cc-card">
        <div className="cc-eyebrow" style={{ marginBottom: 10 }}>Next appointment</div>
        <div className="cc-appt" style={{ gap: 14 }}>
          <div className="cc-datebox" style={{ width: 68 }}>
            <b style={{ fontSize: "1.5rem" }}>14</b>
            <span>Wed · Oct</span>
          </div>
          <div className="cc-li-body">
            <h3 style={{ fontSize: "1rem", marginBottom: 2 }}>Dr. Rohan Rao</h3>
            <div className="cc-sub">Cardiologist · 10:30 AM</div>
          </div>
          <span className="cc-chip ok">Confirmed</span>
        </div>
      </div>
      <div className="cc-card">
        <div className="cc-eyebrow" style={{ marginBottom: 6 }}>Latest prescriptions</div>
        <div className="cc-rx">
          <span className="cc-rx-icon"><LuPill /></span>
          <div><b>Amlodipine 5 mg</b><span>Morning · after meal</span></div>
        </div>
        <div className="cc-rx">
          <span className="cc-rx-icon"><LuPill /></span>
          <div><b>Metformin 500 mg</b><span>Evening · after meal</span></div>
        </div>
      </div>
      <span className="cc-sample">Sample data for illustration</span>
    </div>
  </section>
);

export default HeroSection;
