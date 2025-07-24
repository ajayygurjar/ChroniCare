
import { Spinner } from "react-bootstrap";

const Loader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
    <Spinner animation="border" variant="primary" role="status" />
    <span className="ms-2">Loading...</span>
  </div>
);

export default Loader;
