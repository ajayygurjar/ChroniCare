import { Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LuChevronLeft } from "react-icons/lu";
import RoleToggle from "./RoleToggle";
import PasswordField from "./PasswordField";
import { useFormValidation } from "../../hooks/useFormValidation";
import { friendlyAuthError } from "../../../utils/format";

const initialState = {
  firstName: "",
  lastName: "",
  gender: "",
  age: "",
  phone: "",
  address: "",
  email: "",
  password: "",
  confirmPassword: "",
  speciality: "",
  experience: "",
};

const aboutYouRules = {
  firstName: { required: true, message: "Enter your first name" },
  lastName: { required: true, message: "Enter your last name" },
  gender: { required: true, message: "Select a gender" },
  age: {
    required: true,
    message: "Enter your age",
    custom: (v) => (Number(v) > 0 && Number(v) <= 120 ? "" : "Enter a valid age"),
  },
  phone: { required: true, message: "Enter your phone number" },
};

const accountRules = (role) => ({
  address: { required: true, message: "Enter your address" },
  ...(role === "doctor" && {
    speciality: { required: true, message: "Enter your speciality" },
    experience: {
      required: true,
      message: "Enter your years of experience",
      custom: (v) => (Number(v) >= 0 ? "" : "Enter a valid number of years"),
    },
  }),
  email: {
    required: true,
    message: "Enter a valid email address",
    pattern: /^\S+@\S+\.\S+$/,
  },
  password: {
    required: true,
    message: "Choose a password",
    custom: (v) => (v.length >= 6 ? "" : "Use at least 6 characters"),
  },
  confirmPassword: {
    required: true,
    message: "Confirm your password",
    custom: (v, form) => (v === form.password ? "" : "Passwords do not match"),
  },
});

const SignupForm = ({ onSwitch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [role, setRole] = useState("patient");

  // Validate only the fields shown on the current step.
  const { formData, errors, handleChange, validate } = useFormValidation(
    initialState,
    step === 1 ? aboutYouRules : accountRules(role)
  );

  const goNext = (e) => {
    e.preventDefault();
    if (validate()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);

    const {
      firstName,
      lastName,
      gender,
      age,
      phone,
      address,
      email,
      password,
      speciality,
      experience,
    } = formData;

    const profile = {
      firstName,
      lastName,
      gender,
      age,
      phone,
      address,
      ...(role === "doctor" && { speciality, experience }),
    };

    const result = await dispatch(
      signupUser({ email, password, role, profile })
    );

    if (signupUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  const field = (name, label, props = {}) => (
    <Form.Group className="mb-3" controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        name={name}
        value={formData[name]}
        onChange={handleChange}
        isInvalid={!!errors[name]}
        {...props}
      />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <Form onSubmit={step === 1 ? goNext : handleSubmit} noValidate>
      <div className="cc-steps" aria-label={`Step ${step} of 2`}>
        <span className={step === 1 ? "on" : ""}>
          <b>1</b>About you
        </span>
        <span className="bar" />
        <span className={step === 2 ? "on" : ""}>
          <b>2</b>Account
        </span>
      </div>

      <h2 className="mb-3">Create your account</h2>

      {submitted && error && <Alert variant="danger">{friendlyAuthError(error)}</Alert>}

      {step === 1 ? (
        <>
          <div className="mb-3">
            <RoleToggle value={role} onChange={setRole} />
          </div>

          <Row>
            <Col sm={6}>{field("firstName", "First name", { type: "text", autoComplete: "given-name" })}</Col>
            <Col sm={6}>{field("lastName", "Last name", { type: "text", autoComplete: "family-name" })}</Col>
          </Row>
          <Row>
            <Col sm={6}>
              <Form.Group className="mb-3" controlId="gender">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  isInvalid={!!errors.gender}
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6}>{field("age", "Age", { type: "number", min: 0, max: 120 })}</Col>
          </Row>
          {field("phone", "Phone", { type: "tel", autoComplete: "tel" })}

          <div className="d-grid mt-4">
            <Button size="lg" type="submit">
              Continue
            </Button>
          </div>
        </>
      ) : (
        <>
          {field("address", "Address", { type: "text", autoComplete: "street-address" })}

          {role === "doctor" && (
            <Row>
              <Col sm={7}>{field("speciality", "Speciality", { type: "text", placeholder: "e.g., Cardiologist" })}</Col>
              <Col sm={5}>{field("experience", "Experience (years)", { type: "number", min: 0 })}</Col>
            </Row>
          )}

          {field("email", "Email", { type: "email", placeholder: "you@example.com", autoComplete: "email" })}

          <PasswordField
            id="password"
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <div className="d-flex gap-2 mt-4">
            <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
              <LuChevronLeft aria-hidden="true" /> Back
            </Button>
            <Button size="lg" type="submit" className="flex-grow-1" disabled={isLoading}>
              {isLoading ? <Spinner animation="border" size="sm" /> : "Create account"}
            </Button>
          </div>
        </>
      )}

      <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: 14 }}>
        Already have an account?{" "}
        <Button variant="link" className="p-0 align-baseline" onClick={onSwitch}>
          Log in
        </Button>
      </p>
    </Form>
  );
};

export default SignupForm;
