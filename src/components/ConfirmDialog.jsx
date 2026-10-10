import { Trash2, X } from 'lucide-react';

import IconLabel from './IconLabel.jsx';

function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h2 id="confirm-dialog-title">{title}</h2>
        {message ? <p>{message}</p> : null}
        <div className="dialog__actions">
          <button className="btn btn-outline-secondary" type="button" onClick={onCancel}>
            <IconLabel icon={X} label="Cancel" />
          </button>
          <button className="btn btn-danger" type="button" onClick={onConfirm}>
            <IconLabel icon={Trash2} label={confirmLabel} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
