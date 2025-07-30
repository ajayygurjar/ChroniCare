import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SignupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    speciality: "",
    experience: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const {
      firstName,
      lastName,
      gender,
      age,
      phone,
      address,
      email,
      password,
      role,
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

  return (
    <Form
      style={{ maxWidth: "500px", margin: "0 auto" }}
      className="px-3 w-100"
      onSubmit={handleSubmit}
    >
      <h2 className="mb-4 text-center">Create Account</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3" controlId="firstName">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="lastName">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="gender">
        <Form.Label>Gender</Form.Label>
        <Form.Select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="age">
        <Form.Label>Age</Form.Label>
        <Form.Control
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="phone">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="address">
        <Form.Label>Address</Form.Label>
        <Form.Control
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="confirmPassword">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="role">
        <Form.Label>Role</Form.Label>
        <Form.Select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </Form.Select>
      </Form.Group>

      {formData.role === "doctor" && (
        <>
          <Form.Group className="mb-3" controlId="speciality">
            <Form.Label>Speciality</Form.Label>
            <Form.Control
              type="text"
              name="speciality"
              placeholder="e.g., Cardiologist, Dentist"
              value={formData.speciality}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="experience">
            <Form.Label>Experience (in years)</Form.Label>
            <Form.Control
              type="number"
              name="experience"
              placeholder="Years of experience"
              value={formData.experience}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </>
      )}

      <div className="d-grid">
        <Button variant="primary" type="submit">
          {isLoading ? <Spinner animation="border" size="sm" /> : "Sign Up"}
        </Button>
      </div>
    </Form>
  );
};

export default SignupForm;
