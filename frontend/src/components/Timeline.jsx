import { STATUS } from '@/utils/labels';
import { formatDateTime } from '@/utils/format';

const TYPE_COLOR = {
  CREATED: 'var(--c-open)',
  ASSIGNED: 'var(--c-assigned)',
  NOTE_ADDED: 'var(--muted)',
};

/** Historique des changements d'un incident. */
export default function Timeline({ entries }) {
  return (
    <ol className="timeline">
      {entries.map((h) => {
        const color = h.type === 'STATUS_CHANGED' ? STATUS[h.toStatus]?.color : TYPE_COLOR[h.type];
        return (
          <li key={h.id} style={{ '--tl-color': color }}>
            <span className="tl-dot" />
            <div className="tl-time">{formatDateTime(h.createdAt)}</div>
            <div className="tl-msg">{renderMessage(h)}</div>
            {h.performedBy && <div className="tl-by">par {h.performedBy}</div>}
          </li>
        );
      })}
    </ol>
  );
}

function renderMessage(h) {
  if (h.type === 'STATUS_CHANGED') {
    return (
      <>
        <span className="mono">{h.fromStatus}</span> <span className="faint">→</span>{' '}
        <span className="mono" style={{ color: STATUS[h.toStatus]?.color }}>{h.toStatus}</span>
      </>
    );
  }
  return h.message;
}
