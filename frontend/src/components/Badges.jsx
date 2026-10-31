import { CATEGORY, PRIORITY, STATUS } from '@/utils/labels';

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, color: 'var(--faint)' };
  return (
    <span className="badge" style={{ '--badge-color': s.color }}>
      <span className="dot" /> {s.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || { label: priority, color: 'var(--faint)' };
  return (
    <span className={`badge ${priority === 'CRITICAL' ? 'pulse' : ''}`} style={{ '--badge-color': p.color }}>
      <span className="dot" /> {p.label}
    </span>
  );
}

export function CategoryTag({ category }) {
  const c = CATEGORY[category];
  if (!c) return <span className="tag">{category}</span>;
  const Icon = c.icon;
  return (
    <span className="tag">
      <Icon size={14} /> {c.label}
    </span>
  );
}

export function RolePill({ role, children }) {
  return <span className={`role-pill ${role}`}>{children}</span>;
}
