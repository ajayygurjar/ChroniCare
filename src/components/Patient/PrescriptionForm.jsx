
import { Form, Button } from 'react-bootstrap';

const PrescriptionForm = ({  value, setValue, onSubmit }) => (
  <Form onSubmit={onSubmit} className="d-flex flex-column gap-1">
    <Form.Control
      placeholder="Drug Name"
      value={value.drug || ''}
      onChange={(e) => setValue({ ...value, drug: e.target.value })}
    />
    <Form.Control
      placeholder="Time"
      value={value.time || ''}
      onChange={(e) => setValue({ ...value, time: e.target.value })}
    />
    <Form.Control
      placeholder="Before/After Meal"
      value={value.meal || ''}
      onChange={(e) => setValue({ ...value, meal: e.target.value })}
    />
    <Button type="submit" size="sm">Add</Button>
  </Form>
);

export default PrescriptionForm;
