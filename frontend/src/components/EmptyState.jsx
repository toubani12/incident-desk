import { Inbox } from 'lucide-react';

export default function EmptyState({ title, children, icon: Icon = Inbox, action }) {
  return (
    <div className="empty">
      <Icon size={30} strokeWidth={1.4} />
      <b>{title}</b>
      {children && <span className="small">{children}</span>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
