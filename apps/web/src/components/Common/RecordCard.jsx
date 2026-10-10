import { Button } from 'react-bootstrap';
import { LuPill, LuHourglass } from 'react-icons/lu';

// One medical-history entry. Pass onAddPrescription (doctor view) to offer the action
// when the record has no prescription yet.
const RecordCard = ({ record, onAddPrescription }) => {
  const date = record.date ? new Date(record.date) : null;
  const rx = record.prescription;
  const dosing = rx ? [rx.time, rx.meal].filter(Boolean).join(' · ') : '';

  return (
    <article className="cc-card cc-rec">
      <div className="cc-rec-date">
        <b>{date ? String(date.getDate()).padStart(2, '0') : '--'}</b>
        <span>
          {date ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No date'}
        </span>
      </div>

      <div style={{ minWidth: 0 }}>
        <div className="cc-rec-head">
          <h3>{record.diagnosis}</h3>
          {rx && <span className="cc-chip">Prescription</span>}
        </div>
        {record.notes && <p className="cc-rec-notes">{record.notes}</p>}

        {rx ? (
          <div className="cc-rxbox">
            <LuPill aria-hidden="true" />
            <div className="grow">
              <b>{rx.drug}</b>
              {dosing && ` · ${dosing}`}
              <div className="cc-sub">
                {rx.prescribedBy && `Prescribed by Dr. ${rx.prescribedBy}`}
                {rx.addedAt && ` · ${new Date(rx.addedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              </div>
            </div>
          </div>
        ) : (
          <div className="cc-rxbox empty">
            <LuHourglass aria-hidden="true" />
            <div className="grow">No prescription for this visit</div>
            {onAddPrescription && (
              <Button size="sm" onClick={() => onAddPrescription(record.id)}>
                Add prescription
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default RecordCard;
