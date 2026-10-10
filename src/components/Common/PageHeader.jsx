const PageHeader = ({ title, subtitle, action }) => (
  <div className="cc-page-head">
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
