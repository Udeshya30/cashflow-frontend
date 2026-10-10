function IconLabel({ icon: Icon, label, hideLabel = false, size = 16 }) {
  return (
    <>
      <Icon className="btn-icon" aria-hidden="true" size={size} strokeWidth={2.2} />
      <span className={hideLabel ? 'visually-hidden' : 'btn-label'}>{label}</span>
    </>
  );
}

export default IconLabel;
