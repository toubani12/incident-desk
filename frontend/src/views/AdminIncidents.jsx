'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import incidentService from '@/services/incidentService';
import userService from '@/services/userService';
import { errorMessage } from '@/services/api';
import { useToast } from '@/components/Toast';
import IncidentTable from '@/components/IncidentTable';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import {
  CATEGORY, CATEGORY_KEYS, PRIORITY, PRIORITY_KEYS, STATUS, STATUS_KEYS,
} from '@/utils/labels';

/** Tous les incidents (ADMIN) : filtres côté serveur + affectation rapide. */
export default function AdminIncidents() {
  const { notify } = useToast();
  const [items, setItems] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', q: '' });

  const load = useCallback(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    incidentService.all(params).then(setItems).catch((e) => setError(errorMessage(e)));
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => { userService.technicians().then(setTechnicians).catch(() => {}); }, []);

  async function quickAssign(incident, technicianId) {
    if (!technicianId) return;
    try {
      const d = await incidentService.assign(incident.id, technicianId);
      setItems((list) => list.map((i) => (i.id === incident.id ? d.incident : i)));
      notify(`Incident #${incident.id} affecté à ${d.incident.assignedTo.fullName}`);
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  }

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="h1">Tous les incidents</h1>
          <p className="lead">Filtrez, consultez et affectez les incidents aux techniciens.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <div className="toolbar">
          <div className="input-wrap">
            <Search size={16} className="icon-left" />
            <input className="input" placeholder="Rechercher dans les titres et descriptions" value={filters.q} onChange={set('q')} />
          </div>
          <select className="select" value={filters.status} onChange={set('status')}>
            <option value="">Tous les statuts</option>
            {STATUS_KEYS.map((k) => <option key={k} value={k}>{STATUS[k].label}</option>)}
          </select>
          <select className="select" value={filters.priority} onChange={set('priority')}>
            <option value="">Toutes priorités</option>
            {PRIORITY_KEYS.map((k) => <option key={k} value={k}>{PRIORITY[k].label}</option>)}
          </select>
          <select className="select" value={filters.category} onChange={set('category')}>
            <option value="">Toutes catégories</option>
            {CATEGORY_KEYS.map((k) => <option key={k} value={k}>{CATEGORY[k].label}</option>)}
          </select>
        </div>

        {!items && !error && <Loader />}
        {items && (items.length ? (
          <IncidentTable
            incidents={items}
            columns={['createdBy', 'assignedTo']}
            renderActions={(i) => i.status === 'CLOSED' ? null : (
              <select className="select" style={{ width: 150, padding: '6px 30px 6px 10px', fontSize: 12 }}
                      value="" onChange={(e) => quickAssign(i, e.target.value)} aria-label="Affecter">
                <option value="">{i.assignedTo ? 'Réaffecter…' : 'Affecter…'}</option>
                {technicians.filter((t) => t.id !== i.assignedTo?.id).map((t) => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
            )}
          />
        ) : <EmptyState title="Aucun incident">Aucun incident ne correspond aux filtres.</EmptyState>)}
      </div>
    </div>
  );
}
