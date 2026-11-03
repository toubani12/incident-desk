'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Activity, CircleCheck, CirclePlus, ClipboardList, Flame, Hourglass, Inbox, ListChecks,
  Shield, Siren, UserCog, Users, Wrench,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import incidentService from '@/services/incidentService';
import { errorMessage } from '@/services/api';
import StatCard from '@/components/StatCard';
import Loader from '@/components/Loader';
import EmptyState from '@/components/EmptyState';
import { Bars, Donut } from '@/components/Charts';
import { PriorityBadge, StatusBadge } from '@/components/Badges';
import { CATEGORY, CATEGORY_KEYS, PRIORITY, PRIORITY_KEYS, ROLE, STATUS, STATUS_KEYS } from '@/utils/labels';
import { firstName, timeAgo } from '@/utils/format';

/** Tableau de bord unique dont le contenu dépend du rôle connecté (GET /api/dashboard). */
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    incidentService.dashboard().then(setData).catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <p className="eyebrow">{ROLE[user.role]} · Tableau de bord</p>
          <h1 className="h1">Bonjour, {firstName(user.fullName)}</h1>
        </div>
        <div className="actions">
          {user.role === 'EMPLOYEE' && (
            <Link href="/incidents/new" className="btn btn-primary"><CirclePlus size={15} /> Déclarer un incident</Link>
          )}
          {user.role === 'TECHNICIAN' && (
            <Link href="/assigned" className="btn btn-primary"><Wrench size={15} /> Mes incidents affectés</Link>
          )}
          {user.role === 'ADMIN' && (
            <>
              <Link href="/admin/users" className="btn btn-outline"><UserCog size={15} /> Utilisateurs</Link>
              <Link href="/admin/incidents" className="btn btn-primary"><ListChecks size={15} /> Tous les incidents</Link>
            </>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!data && !error && <Loader />}
      {data?.role === 'EMPLOYEE' && <EmployeeView d={data} />}
      {data?.role === 'TECHNICIAN' && <TechnicianView d={data} />}
      {data?.role === 'ADMIN' && <AdminView d={data} />}
    </div>
  );
}

function EmployeeView({ d }) {
  return (
    <div className="stack">
      <div className="grid-stats">
        <StatCard label="Mes incidents" value={d.total} icon={ClipboardList} hint="Total déclaré" />
        <StatCard label="Ouverts" value={d.open} icon={Inbox} accent="var(--c-open)" hint="En attente d’affectation" />
        <StatCard label="Affectés" value={d.assigned} icon={UserCog} accent="var(--c-assigned)" hint="Technicien désigné" />
        <StatCard label="En cours" value={d.inProgress} icon={Activity} accent="var(--c-progress)" hint="En traitement" />
        <StatCard label="Résolus / clôturés" value={d.resolvedOrClosed} icon={CircleCheck} accent="var(--c-resolved)" />
      </div>
      <RecentCard title="Mes derniers incidents" items={d.recentIncidents} empty="Aucun incident déclaré pour l’instant"
                  emptyAction={<Link href="/incidents/new" className="btn btn-primary btn-sm">Déclarer un incident</Link>}
                  moreHref="/incidents" />
    </div>
  );
}

function TechnicianView({ d }) {
  return (
    <div className="stack">
      <div className="grid-stats">
        <StatCard label="Affectés" value={d.assigned} icon={ClipboardList} hint="Depuis le début" />
        <StatCard label="Critiques" value={d.critical} icon={Siren} accent="var(--c-critical)" hint="Non clôturés" />
        <StatCard label="À démarrer" value={d.toStart} icon={Hourglass} accent="var(--c-assigned)" />
        <StatCard label="En cours" value={d.inProgress} icon={Activity} accent="var(--c-progress)" />
        <StatCard label="Résolus" value={d.resolved} icon={CircleCheck} accent="var(--c-resolved)" hint="Résolus ou clôturés" />
      </div>
      <RecentCard title="Activité récente" items={d.recentIncidents} empty="Aucun incident ne vous est affecté" moreHref="/assigned" showReporter />
    </div>
  );
}

function AdminView({ d }) {
  const statusData = STATUS_KEYS.map((k) => ({ label: STATUS[k].label, value: d.byStatus[k] || 0, color: STATUS[k].color }));
  const categoryData = CATEGORY_KEYS.map((k) => ({ label: CATEGORY[k].label, value: d.byCategory[k] || 0 }))
    .sort((a, b) => b.value - a.value);
  const priorityData = PRIORITY_KEYS.map((k) => ({ label: PRIORITY[k].label, value: d.byPriority[k] || 0, color: PRIORITY[k].color }));
  const workload = d.technicianWorkload.map((t) => ({ label: t.fullName, value: t.total }));

  return (
    <div className="stack">
      <p className="eyebrow" style={{ margin: '4px 0 -6px' }}>Utilisateurs</p>
      <div className="grid-stats">
        <StatCard label="Utilisateurs" value={d.totalUsers} icon={Users} hint={`${d.disabledUsers} désactivé(s)`} />
        <StatCard label="Employés" value={d.employees} icon={Users} accent="var(--c-resolved)" />
        <StatCard label="Techniciens" value={d.technicians} icon={Wrench} accent="var(--c-progress)" />
        <StatCard label="Administrateurs" value={d.admins} icon={Shield} accent="var(--ember-300)" />
      </div>

      <p className="eyebrow" style={{ margin: '10px 0 -6px' }}>Incidents</p>
      <div className="grid-stats">
        <StatCard label="Total" value={d.totalIncidents} icon={ClipboardList} />
        <StatCard label="Ouverts" value={d.open} icon={Inbox} accent="var(--c-open)" hint={`+ ${d.assigned} affecté(s)`} />
        <StatCard label="En cours" value={d.inProgress} icon={Activity} accent="var(--c-progress)" hint={`${d.resolved} résolu(s)`} />
        <StatCard label="Clôturés" value={d.closed} icon={CircleCheck} accent="var(--c-closed)" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h2 className="h2"><Activity size={16} /> Répartition par statut</h2></div>
          <Donut data={statusData} total={d.totalIncidents} label="incidents" />
        </div>
        <div className="card">
          <div className="card-head"><h2 className="h2"><Flame size={16} /> Par priorité</h2></div>
          <Bars data={priorityData} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h2 className="h2"><ClipboardList size={16} /> Par catégorie</h2></div>
          <Bars data={categoryData} />
        </div>
        <div className="card">
          <div className="card-head"><h2 className="h2"><Wrench size={16} /> Charge des techniciens</h2></div>
          {workload.length ? <Bars data={workload} /> : <EmptyState title="Aucune affectation" />}
        </div>
      </div>

      <RecentCard title="Derniers incidents déclarés" items={d.recentIncidents} empty="Aucun incident" moreHref="/admin/incidents" showReporter />
    </div>
  );
}

function RecentCard({ title, items, empty, emptyAction, moreHref, showReporter }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2 className="h2"><ClipboardList size={16} /> {title}</h2>
        {moreHref && items.length > 0 && <Link href={moreHref} className="link small">Tout voir</Link>}
      </div>
      {items.length === 0 ? (
        <EmptyState title={empty} action={emptyAction} />
      ) : (
        <div className="recent">
          {items.map((i) => (
            <Link key={i.id} href={`/incidents/${i.id}`}>
              <span className="id-cell">#{i.id}</span>
              <span className="r-main">
                <b>{i.title}</b>
                <span>
                  {showReporter && i.createdBy ? `${i.createdBy.fullName} · ` : ''}
                  {CATEGORY[i.category]?.label} · {timeAgo(i.updatedAt)}
                </span>
              </span>
              <PriorityBadge priority={i.priority} />
              <StatusBadge status={i.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
