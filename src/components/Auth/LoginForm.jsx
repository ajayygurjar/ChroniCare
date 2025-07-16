
import { Form, Button,Spinner,Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginWithRole } from "../../../store/authSlice";
import { useState } from "react";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);
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
    <Form
      style={{ maxWidth: "400px", margin: "0 auto" }}
      onSubmit={handleSubmit}
    >
      <h2 className="mb-4 text-center">Login</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3" controlId="formEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          name="email"
          type="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-4" controlId="formRole">
        <Form.Label>Select Role</Form.Label>
        <Form.Select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="patient">Login as Patient</option>
          <option value="doctor">Login as Doctor</option>
        </Form.Select>
      </Form.Group>

      <div className="d-grid">
        <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : "Login"}
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
