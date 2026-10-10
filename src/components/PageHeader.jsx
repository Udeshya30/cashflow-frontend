function PageHeader({ title, eyebrow, children }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
      </div>
      {children ? <div className="page-header__actions">{children}</div> : null}
    </div>
  );
}

export default PageHeader;
