import { Pencil, Trash2 } from 'lucide-react';

import { formatDate } from '../utils/dates.js';
import IconLabel from './IconLabel.jsx';

function TimelineEntry({ entry, highlighted = false, onEdit, onDelete }) {
  return (
    <article className={`timeline-entry ${highlighted ? 'timeline-entry--highlighted' : ''}`}>
      <div className="timeline-entry__date">
        <span>{formatDate(entry.entry_date)}</span>
        {highlighted ? <strong>Current</strong> : null}
      </div>
      <div className="timeline-entry__content">
        <div className="timeline-entry__header">
          <h3>{entry.activity}</h3>
          <div className="timeline-entry__actions">
            <button
              aria-label={`Edit ${entry.activity}`}
              className="btn btn-outline-primary btn-sm btn-icon-only"
              title="Edit"
              type="button"
              onClick={onEdit}
            >
              <IconLabel icon={Pencil} label="Edit" hideLabel />
            </button>
            <button
              aria-label={`Delete ${entry.activity}`}
              className="btn btn-outline-danger btn-sm btn-icon-only"
              title="Delete"
              type="button"
              onClick={onDelete}
            >
              <IconLabel icon={Trash2} label="Delete" hideLabel />
            </button>
          </div>
        </div>
        {entry.notes ? <p>{entry.notes}</p> : null}
        <dl>
          <div>
            <dt>Next date</dt>
            <dd>{formatDate(entry.next_date)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default TimelineEntry;
