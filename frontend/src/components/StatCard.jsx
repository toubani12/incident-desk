export default function StatCard({ label, value, hint, icon: Icon, accent }) {
  return (
    <div className="stat" style={accent ? { '--accent': accent } : undefined}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && <Icon size={17} className="stat-icon" />}
      </div>
      <div className="stat-value">{value ?? '–'}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
