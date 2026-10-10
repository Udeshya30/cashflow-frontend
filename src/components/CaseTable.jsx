import { Eye, NotebookPen, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getNextKnownDate } from '../utils/cases.js';
import { formatDate, formatDateTime } from '../utils/dates.js';
import IconLabel from './IconLabel.jsx';
import StatusBadge from './StatusBadge.jsx';

function CaseTable({ cases, onStatusChange }) {
  return (
    <div className="table-shell">
      <table className="case-table">
        <thead>
          <tr>
            <th scope="col">Court</th>
            <th scope="col">Case number</th>
            <th scope="col">Party</th>
            <th scope="col">Status</th>
            <th scope="col">Next date</th>
            <th scope="col">Updated</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem) => (
            <tr key={caseItem.id}>
              <td>{caseItem.court_name || 'Not set'}</td>
              <td>{caseItem.case_number || 'Not set'}</td>
              <td>{caseItem.party_name || 'Not set'}</td>
              <td>
                {onStatusChange ? (
                  <select
                    className="form-select form-select-sm"
                    value={caseItem.status}
                    onChange={(event) => onStatusChange(caseItem.id, event.target.value)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="DISPOSED">Disposed</option>
                    <option value="CLOSED">Closed</option>
                    <option value="STAYED">Stayed</option>
                    <option value="TRANSFERRED">Transferred</option>
                  </select>
                ) : (
                  <StatusBadge status={caseItem.status} />
                )}
              </td>
              <td>{formatDate(getNextKnownDate(caseItem))}</td>
              <td>{formatDateTime(caseItem.updated_at)}</td>
              <td>
                <div className="table-actions">
                  <Link
                    aria-label={`Open ${caseItem.case_title}`}
                    className="btn btn-outline-primary btn-sm btn-icon-only"
                    title="Open"
                    to={`/cases/${caseItem.id}`}
                  >
                    <IconLabel icon={Eye} label="Open" hideLabel />
                  </Link>
                  <Link
                    aria-label={`Add diary entry for ${caseItem.case_title}`}
                    className="btn btn-outline-secondary btn-sm btn-icon-only"
                    title="Add entry"
                    to={`/cases/${caseItem.id}`}
                  >
                    <IconLabel icon={NotebookPen} label="Add entry" hideLabel />
                  </Link>
                  <Link
                    aria-label={`Edit ${caseItem.case_title}`}
                    className="btn btn-outline-secondary btn-sm btn-icon-only"
                    title="Edit"
                    to={`/cases/${caseItem.id}/edit`}
                  >
                    <IconLabel icon={Pencil} label="Edit" hideLabel />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CaseTable;
