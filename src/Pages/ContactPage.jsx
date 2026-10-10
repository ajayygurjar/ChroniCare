import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { LuMail, LuPhone, LuMapPin, LuClock, LuSend, LuTriangleAlert } from 'react-icons/lu';
import PageHeader from '../components/Common/PageHeader';

const SUPPORT_EMAIL = 'support@chronicare.com';

const ContactPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [opened, setOpened] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // There is no message backend, so hand the message to the visitor's email app
  // instead of pretending it was sent.
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = `[${formData.subject}] Message from ${formData.name}`;
    const body = `${formData.message}\n\n${formData.name}\n${formData.email}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <div className={token ? 'cc-narrow' : 'cc-section cc-narrow'}>
      <PageHeader title="Contact us" subtitle="We're here to help. Reach out anytime." />

      {opened && (
        <Alert variant="success">
          Your email app should open with the message ready to send. If it didn't, write to{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </Alert>
      )}

      <div className="cc-grid g32 top">
        <div className="cc-card">
          <div className="cc-eyebrow">Get in touch</div>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <Form.Group className="col-md-6" controlId="contact-name">
                <Form.Label>Full name</Form.Label>
                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} autoComplete="name" required />
              </Form.Group>
              <Form.Group className="col-md-6" controlId="contact-email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" required />
              </Form.Group>
            </div>

            <Form.Group className="mb-3" controlId="contact-subject">
              <Form.Label>Subject</Form.Label>
              <Form.Select name="subject" value={formData.subject} onChange={handleChange} required>
                <option value="">Select a subject</option>
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Appointment Help</option>
                <option>Billing</option>
                <option>Feedback</option>
                <option>Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4" controlId="contact-message">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help?"
                required
              />
            </Form.Group>

            <Button type="submit" size="lg">
              <LuSend aria-hidden="true" /> Send message
            </Button>
          </Form>
        </div>

        <div className="cc-stack">
          <div className="cc-card">
            <div className="cc-eyebrow">Contact info</div>
            <p className="mb-3"><b>ChroniCare Healthcare</b></p>
            <ul className="cc-list">
              <li className="cc-li">
                <LuMail className="cc-chev" aria-hidden="true" />
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </li>
              <li className="cc-li">
                <LuPhone className="cc-chev" aria-hidden="true" />
                <a href="tel:+1234567890">+1 (234) 567-8900</a>
              </li>
              <li className="cc-li">
                <LuMapPin className="cc-chev" aria-hidden="true" />
                <span>123 Healthcare Ave, City, State</span>
              </li>
              <li className="cc-li">
                <LuClock className="cc-chev" aria-hidden="true" />
                <span>Mon–Fri 8AM–6PM, Sat 9AM–4PM</span>
              </li>
            </ul>
          </div>

          <div className="cc-card" style={{ background: 'var(--cc-no-bg)', borderColor: '#EFC3BD' }}>
            <div className="cc-eyebrow" style={{ color: 'var(--cc-no-fg)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <LuTriangleAlert aria-hidden="true" /> Emergency
            </div>
            <p className="mb-1">For emergencies, call:</p>
            <a href="tel:911" className="h2 mb-0" style={{ color: 'var(--cc-no-fg)', textDecoration: 'none' }}>911</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
