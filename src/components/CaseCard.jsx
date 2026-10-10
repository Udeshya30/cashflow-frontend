import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getNextKnownDate } from '../utils/cases.js';
import { formatDate } from '../utils/dates.js';
import IconLabel from './IconLabel.jsx';
import StatusBadge from './StatusBadge.jsx';

function CaseCard({ caseItem }) {
  return (
    <article className="case-card">
      <div className="case-card__header">
        <div>
          <p>{caseItem.case_number || 'No case number'}</p>
          <h2>{caseItem.case_title}</h2>
        </div>
        <StatusBadge status={caseItem.status} />
      </div>
      <dl className="case-card__meta">
        <div>
          <dt>Party</dt>
          <dd>{caseItem.party_name || 'Not set'}</dd>
        </div>
        <div>
          <dt>Next date</dt>
          <dd>{formatDate(getNextKnownDate(caseItem))}</dd>
        </div>
      </dl>
      <Link className="btn btn-outline-primary btn-sm" to={`/cases/${caseItem.id}`}>
        <IconLabel icon={Eye} label="Open" />
      </Link>
    </article>
  );
}

export default CaseCard;
