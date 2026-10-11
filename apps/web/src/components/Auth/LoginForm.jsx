import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginWithRole } from "../../../store/authSlice";
import { useState } from "react";
import RoleToggle from "./RoleToggle";
import PasswordField from "./PasswordField";

const LoginForm = ({ onSwitch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "patient",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const result = await dispatch(
      loginWithRole({
        email: formData.email,
        password: formData.password,
        expectedRole: formData.role,
      })
    );

    if (loginWithRole.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Log in</h2>
      <p className="text-muted mb-3">I am a…</p>

      <div className="mb-3">
        <RoleToggle
          value={formData.role}
          onChange={(role) => setFormData((prev) => ({ ...prev, role }))}
        />
      </div>

      {submitted && error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3" controlId="formEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <PasswordField
        id="formPassword"
        label="Password"
        name="password"
        placeholder="Your password"
        autoComplete="current-password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <div className="d-grid mt-4">
        <Button size="lg" type="submit" disabled={isLoading}>
          {isLoading ? <Spinner animation="border" size="sm" /> : "Log in"}
        </Button>
      </div>

      <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: 14 }}>
        New to ChroniCare?{" "}
        <Button variant="link" className="p-0 align-baseline" onClick={onSwitch}>
          Create an account
        </Button>
      </p>
    </Form>
  );
};

export default LoginForm;
