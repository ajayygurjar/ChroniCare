
import { Form, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../store/authSlice";

const LoginForm = () => {
    const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
     {
      dispatch(login());         
      navigate("/dashboard");    
    }
  };


    return (
    <Form  style={{ maxWidth: "400px", margin: "0 auto" }} onSubmit={handleSubmit}>
      <h2 className="mb-4 text-center">Login</h2>

      <Form.Group className="mb-3" controlId="formEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" placeholder="Enter email" required />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" required />
      </Form.Group>

      <Form.Group className="mb-4" controlId="formRole">
        <Form.Label>Select Role</Form.Label>
        <Form.Select required>
          <option value="patient">Login as Patient</option>
          <option value="doctor">Login as Doctor</option>
        </Form.Select>
      </Form.Group>

      <div className="d-grid">
        <Button variant="primary" type="submit">
          Login
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
