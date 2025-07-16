import React from "react";
import { Form, Button } from "react-bootstrap";

const SignupForm = () => {
  return (
    <Form style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2 className="mb-4 text-center">Create Account</h2>

      <Form.Group className="mb-3" controlId="firstName">
        <Form.Label>First Name</Form.Label>
        <Form.Control type="text" name="firstName" placeholder="First Name" required />
      </Form.Group>

      <Form.Group className="mb-3" controlId="lastName">
        <Form.Label>Last Name</Form.Label>
        <Form.Control type="text" name="lastName" placeholder="Last Name" required />
      </Form.Group>

      <Form.Group className="mb-3" controlId="gender">
        <Form.Label>Gender</Form.Label>
        <Form.Select name="gender" required>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="age">
        <Form.Label>Age</Form.Label>
        <Form.Control type="number" name="age" placeholder="Age" required />
      </Form.Group>

      <Form.Group className="mb-3" controlId="phone">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control type="text" name="phone" placeholder="Phone Number" required />
      </Form.Group>

      <Form.Group className="mb-3" controlId="address">
        <Form.Label>Address</Form.Label>
        <Form.Control type="text" name="address" placeholder="Address" required />
      </Form.Group>

      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" name="email" placeholder="Email" required />
      </Form.Group>

      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" name="password" placeholder="Password" required />
      </Form.Group>

      <Form.Group className="mb-3" controlId="confirmPassword">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control type="password" name="confirmPassword" placeholder="Confirm Password" required />
      </Form.Group>

      <Form.Group className="mb-4" controlId="role">
        <Form.Label>Select Role</Form.Label>
        <Form.Select name="role" required>
          <option value="">Select Role</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </Form.Select>
      </Form.Group>

      <div className="d-grid">
        <Button variant="primary" type="submit">
          Sign Up
        </Button>
      </div>
    </Form>
  );
};

export default SignupForm;
