'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CirclePlus, Search } from 'lucide-react';
import incidentService from '@/services/incidentService';
import { errorMessage } from '@/services/api';
import IncidentTable from '@/components/IncidentTable';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { STATUS, STATUS_KEYS } from '@/utils/labels';

/** Liste des incidents de l'employé connecté (GET /api/incidents/my). */
export default function MyIncidents() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ALL');
  const [q, setQ] = useState('');

  useEffect(() => {
    incidentService.mine().then(setItems).catch((e) => setError(errorMessage(e)));
  }, []);

  const filtered = useMemo(() => filterIncidents(items, status, q), [items, status, q]);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <p className="eyebrow">Employé</p>
          <h1 className="h1">Mes incidents</h1>
          <p className="lead">Seuls les incidents que vous avez déclarés sont visibles ici.</p>
        </div>
        <div className="actions">
          <Link href="/incidents/new" className="btn btn-primary"><CirclePlus size={15} /> Déclarer</Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!items && !error && <Loader />}
      {items && (
        <div className="card">
          <StatusFilter items={items} status={status} setStatus={setStatus} q={q} setQ={setQ} />
          {filtered.length ? (
            <IncidentTable incidents={filtered} columns={['assignedTo']} />
          ) : (
            <EmptyState title={items.length ? 'Aucun résultat' : 'Aucun incident'}
                        action={!items.length && <Link href="/incidents/new" className="btn btn-primary btn-sm">Déclarer un incident</Link>}>
              {items.length ? 'Modifiez les filtres.' : 'Vous n’avez encore déclaré aucun incident.'}
            </EmptyState>
          )}
        </div>
      )}
    </div>
  );
}

export function filterIncidents(items, status, q) {
  if (!items) return [];
  const needle = q.trim().toLowerCase();
  return items.filter((i) =>
    (status === 'ALL' || i.status === status) &&
    (!needle || i.title.toLowerCase().includes(needle) || String(i.id) === needle.replace('#', '')));
}

export function StatusFilter({ items, status, setStatus, q, setQ }) {
  const count = (s) => items.filter((i) => i.status === s).length;
  return (
    <div className="toolbar">
      <div className="input-wrap">
        <Search size={16} className="icon-left" />
        <input className="input" placeholder="Rechercher par titre ou #id" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="chips">
        <button className={`chip ${status === 'ALL' ? 'active' : ''}`} onClick={() => setStatus('ALL')}>
          Tous <span className="count">{items.length}</span>
        </button>
        {STATUS_KEYS.map((s) => (
          <button key={s} className={`chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
            {STATUS[s].label} <span className="count">{count(s)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
