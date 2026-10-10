import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="cc-cta">
    <div>
      <h2>Ready to get started?</h2>
      <p>Create a free account as a patient or as a doctor.</p>
    </div>
    <div className="d-flex flex-wrap gap-2">
      <Button as={Link} to="/auth" state={{ mode: "signup" }} variant="ghost" size="lg">
        Create account
      </Button>
      <Button as={Link} to="/contact" variant="link" size="lg" style={{ "--bs-btn-color": "var(--cc-bg)", "--bs-btn-hover-color": "#fff" }}>
        Contact us
      </Button>
    </div>
  </section>
);

export default CTASection;
