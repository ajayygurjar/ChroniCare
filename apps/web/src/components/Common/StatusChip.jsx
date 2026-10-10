import { statusMeta } from '../../../utils/format';

const StatusChip = ({ status }) => {
  const { label, tone } = statusMeta(status);
  return <span className={`cc-chip ${tone}`}>{label}</span>;
};

export default StatusChip;
