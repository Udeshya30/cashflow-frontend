function LoadingState({ message = 'Loading' }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <span className="state-panel__spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default LoadingState;
