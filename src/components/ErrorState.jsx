import { RotateCcw } from 'lucide-react';

import IconLabel from './IconLabel.jsx';

function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <div>
        <h2>{title}</h2>
        {message ? <p>{message}</p> : null}
      </div>
      {onRetry ? (
        <button className="btn btn-outline-danger" type="button" onClick={onRetry}>
          <IconLabel icon={RotateCcw} label="Retry" />
        </button>
      ) : null}
    </div>
  );
}

export default ErrorState;
