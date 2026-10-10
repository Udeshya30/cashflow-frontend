const statusLabels = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  DISPOSED: 'Disposed',
  CLOSED: 'Closed',
  STAYED: 'Stayed',
  TRANSFERRED: 'Transferred',
};

function StatusBadge({ status }) {
  const normalizedStatus = status ?? 'ACTIVE';

  return (
    <span className={`status-badge status-badge--${normalizedStatus.toLowerCase()}`}>
      {statusLabels[normalizedStatus] ?? normalizedStatus}
    </span>
  );
}

export default StatusBadge;
