'use client';

import { useEffect, useMemo, useState } from 'react';
import incidentService from '@/services/incidentService';
import { errorMessage } from '@/services/api';
import IncidentTable from '@/components/IncidentTable';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { filterIncidents, StatusFilter } from './MyIncidents';

/** Incidents affectés au technicien connecté (GET /api/incidents/assigned). */
export default function AssignedIncidents() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ALL');
  const [q, setQ] = useState('');

  useEffect(() => {
    incidentService.assigned().then(setItems).catch((e) => setError(errorMessage(e)));
  }, []);

  const filtered = useMemo(() => filterIncidents(items, status, q), [items, status, q]);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <p className="eyebrow">Technicien</p>
          <h1 className="h1">Incidents affectés</h1>
          <p className="lead">Ouvrez un incident pour changer son statut ou ajouter une note de traitement.</p>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {!items && !error && <Loader />}
      {items && (
        <div className="card">
          <StatusFilter items={items} status={status} setStatus={setStatus} q={q} setQ={setQ} />
          {filtered.length ? (
            <IncidentTable incidents={filtered} columns={['createdBy']} />
          ) : (
            <EmptyState title={items.length ? 'Aucun résultat' : 'Rien à traiter'}>
              {items.length ? 'Modifiez les filtres.' : 'Aucun incident ne vous est affecté pour le moment.'}
            </EmptyState>
          )}
        </div>
      )}
    </div>
  );
}
