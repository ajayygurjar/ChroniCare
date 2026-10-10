const EmptyState = ({ icon: Icon, message, children }) => (
  <div className="cc-empty">
    {Icon && <Icon aria-hidden="true" />}
    <p>{message}</p>
    {children}
  </div>
);

export default EmptyState;
