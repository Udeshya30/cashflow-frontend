function SuccessState({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="state-panel state-panel--success" role="status" aria-live="polite">
      <span>{message}</span>
    </div>
  );
}

export default SuccessState;
