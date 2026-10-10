function EmptyState({ title, message, children }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {message ? <p>{message}</p> : null}
      {children ? <div className="empty-state__actions">{children}</div> : null}
    </div>
  );
}

export default EmptyState;
