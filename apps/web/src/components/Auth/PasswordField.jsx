import { useState } from "react";
import { Form } from "react-bootstrap";
import { LuEye, LuEyeOff } from "react-icons/lu";

const PasswordField = ({ id, label, error, ...inputProps }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{label}</Form.Label>
      <div className="cc-pw">
        <Form.Control
          type={visible ? "text" : "password"}
          isInvalid={!!error}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <LuEyeOff aria-hidden="true" /> : <LuEye aria-hidden="true" />}
        </button>
      </div>
      {error && <Form.Control.Feedback type="invalid" className="d-block">{error}</Form.Control.Feedback>}
    </Form.Group>
  );
};

export default PasswordField;
