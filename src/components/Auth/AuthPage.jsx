import React, { useState } from "react";
import { Container, Button, Card } from "react-bootstrap";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const AuthPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode((prev) => !prev);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: "100%", maxWidth: "500px", padding: "2rem" }}>
        {isLoginMode ? <LoginForm /> : <SignupForm />}

        <div className="text-center mt-3">
          <Button variant="link" onClick={toggleMode}>
            {isLoginMode
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default AuthPage;
