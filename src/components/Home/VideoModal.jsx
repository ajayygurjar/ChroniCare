
import React from "react";
import { Modal } from "react-bootstrap";

const VideoModal = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} size="lg" centered>
    <Modal.Header closeButton>
      <Modal.Title>ChroniCare Demo</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center p-5">
      <div className="mb-4" style={{ fontSize: "4rem" }}>🎬</div>
      <h5>Demo Video Coming Soon!</h5>
      <p className="text-muted">
        We're preparing an amazing demo video to show you all the features of ChroniCare. Stay tuned!
      </p>
    </Modal.Body>
  </Modal>
);

export default VideoModal;
