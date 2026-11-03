'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/userService';
import { errorMessage } from '@/services/api';
import { useToast } from '@/components/Toast';
import Loader from '@/components/Loader';
import EmptyState from '@/components/EmptyState';
import { ROLE } from '@/utils/labels';
import { formatDate, initials } from '@/utils/format';

const ROLES = ['EMPLOYEE', 'TECHNICIAN', 'ADMIN'];

/** Gestion des comptes : activation / désactivation et changement de rôle. */
export default function AdminUsers() {
  const { user: me } = useAuth();
  const { notify } = useToast();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [role, setRole] = useState('ALL');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    userService.list().then(setUsers).catch((e) => setError(errorMessage(e)));
  }, []);

  const replace = (u) => setUsers((list) => list.map((x) => (x.id === u.id ? u : x)));

  async function toggle(u) {
    setBusy(u.id);
    try {
      const updated = u.enabled ? await userService.disable(u.id) : await userService.enable(u.id);
      replace(updated);
      notify(`${updated.fullName} ${updated.enabled ? 'activé' : 'désactivé'}`);
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setBusy(null);
    }
  }

  async function changeRole(u, newRole) {
    setBusy(u.id);
    try {
      const updated = await userService.changeRole(u.id, newRole);
      replace(updated);
      notify(`${updated.fullName} est maintenant ${ROLE[newRole]}`);
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setBusy(null);
    }
  }

  const filtered = useMemo(() => {
    if (!users) return [];
    const n = q.trim().toLowerCase();
    return users.filter((u) => (role === 'ALL' || u.role === role) &&
      (!n || u.fullName.toLowerCase().includes(n) || u.email.toLowerCase().includes(n)));
  }, [users, role, q]);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="h1">Utilisateurs</h1>
          <p className="lead">Un compte désactivé ne peut plus se connecter et ses sessions sont révoquées.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!users && !error && <Loader />}
      {users && (
        <div className="card">
          <div className="toolbar">
            <div className="input-wrap">
              <Search size={16} className="icon-left" />
              <input className="input" placeholder="Rechercher un nom ou un email" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="chips">
              <button className={`chip ${role === 'ALL' ? 'active' : ''}`} onClick={() => setRole('ALL')}>
                Tous <span className="count">{users.length}</span>
              </button>
              {ROLES.map((r) => (
                <button key={r} className={`chip ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
                  {ROLE[r]} <span className="count">{users.filter((u) => u.role === r).length}</span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? <EmptyState title="Aucun utilisateur" /> : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Utilisateur</th><th>Rôle</th><th>Inscrit le</th><th>Compte</th></tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const self = u.id === me.userId;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="person">
                            <span className="avatar">{initials(u.fullName)}</span>
                            <span className="meta">
                              <b>{u.fullName} {self && <span className="faint small">(vous)</span>}</b>
                              <span>{u.email}</span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <select className="select" style={{ width: 170, padding: '8px 34px 8px 12px', fontSize: 13 }}
                                  value={u.role} disabled={self || busy === u.id}
                                  onChange={(e) => changeRole(u, e.target.value)}>
                            {ROLES.map((r) => <option key={r} value={r}>{ROLE[r]}</option>)}
                          </select>
                        </td>
                        <td className="small muted">{formatDate(u.createdAt)}</td>
                        <td>
                          <div className="row">
                            <button className={`switch ${u.enabled ? 'on' : ''}`} disabled={self || busy === u.id}
                                    onClick={() => toggle(u)} aria-label={u.enabled ? 'Désactiver' : 'Activer'} />
                            <span className="small" style={{ color: u.enabled ? 'var(--c-resolved)' : 'var(--faint)' }}>
                              {u.enabled ? 'Actif' : 'Désactivé'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
