'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, FileText, History, Lock, MessageSquare, Send, ShieldAlert, UserCog, Wrench,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import incidentService from '@/services/incidentService';
import userService from '@/services/userService';
import { errorMessage } from '@/services/api';
import { useToast } from '@/components/Toast';
import Loader from '@/components/Loader';
import Timeline from '@/components/Timeline';
import EmptyState from '@/components/EmptyState';
import { CategoryTag, PriorityBadge, RolePill, StatusBadge } from '@/components/Badges';
import { ROLE, STATUS } from '@/utils/labels';
import { formatDateTime, initials } from '@/utils/format';

/**
 * Détail d'un incident. Les boutons affichés dépendent des "permissions" calculées par le
 * backend, mais chaque action est de toute façon re-contrôlée côté serveur.
 */
export default function IncidentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { notify } = useToast();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  const load = useCallback(() => {
    incidentService.get(id)
      .then(setDetail)
      .catch((e) => setError({ status: e.response?.status, message: errorMessage(e) }));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (user.role === 'ADMIN') userService.technicians().then(setTechnicians).catch(() => {});
  }, [user.role]);

  if (error) {
    const backHref = user.role === 'ADMIN' ? '/admin/incidents' : user.role === 'TECHNICIAN' ? '/assigned' : '/incidents';
    return (
      <div className="container forbidden">
        <div className="code">{error.status || '!'}</div>
        <p className="eyebrow" style={{ marginTop: 18 }}>{error.status === 403 ? 'Accès refusé' : 'Erreur'}</p>
        <p className="lead" style={{ margin: '12px auto 28px' }}>{error.message}</p>
        <Link href={backHref} className="btn btn-primary"><ShieldAlert size={15} /> Retour</Link>
      </div>
    );
  }
  if (!detail) return <Loader />;

  const { incident: inc, history, comments, permissions } = detail;
  const backHref = user.role === 'ADMIN' ? '/admin/incidents' : user.role === 'TECHNICIAN' ? '/assigned' : '/incidents';

  return (
    <div className="container">
      <Link href={backHref} className="back-link"><ArrowLeft size={14} /> Retour à la liste</Link>

      <div className="page-head" style={{ marginTop: 12 }}>
        <div className="detail-title">
          <p className="eyebrow">Incident #{inc.id}</p>
          <h1 className="h1" style={{ fontSize: 'clamp(26px, 3.4vw, 38px)' }}>{inc.title}</h1>
          <div className="meta">
            <StatusBadge status={inc.status} />
            <PriorityBadge priority={inc.priority} />
            <CategoryTag category={inc.category} />
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <section className="card">
            <div className="card-head"><h2 className="h2"><FileText size={16} /> Description</h2></div>
            <p className="description">{inc.description}</p>
          </section>

          <section className="card">
            <div className="card-head">
              <h2 className="h2"><MessageSquare size={16} /> Notes de traitement</h2>
              <span className="faint small">{comments.length}</span>
            </div>
            {comments.length === 0 ? (
              <EmptyState icon={MessageSquare} title="Aucune note">Les techniciens ajoutent ici le suivi de leur intervention.</EmptyState>
            ) : (
              <div className="notes">
                {comments.map((c) => (
                  <div key={c.id} className="note">
                    <div className="note-head">
                      <span className="avatar sm">{initials(c.author.fullName)}</span>
                      <b>{c.author.fullName}</b>
                      <RolePill role={c.author.role}>{ROLE[c.author.role]}</RolePill>
                      <span className="spacer" />
                      <span>{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p>{c.content}</p>
                  </div>
                ))}
              </div>
            )}
            {permissions.canComment && <CommentForm id={inc.id} onDone={() => { load(); notify('Note ajoutée'); }} />}
          </section>

          <section className="card">
            <div className="card-head"><h2 className="h2"><History size={16} /> Historique</h2></div>
            <Timeline entries={history} />
          </section>
        </div>

        <aside className="stack">
          <section className="card">
            <dl className="info-list">
              <div><dt>Déclaré par</dt><dd><PersonLine user={inc.createdBy} /></dd></div>
              <div>
                <dt>Technicien</dt>
                <dd>{inc.assignedTo ? <PersonLine user={inc.assignedTo} /> : <span className="faint">Non affecté</span>}</dd>
              </div>
              <div><dt>Créé le</dt><dd>{formatDateTime(inc.createdAt)}</dd></div>
              <div><dt>Dernière mise à jour</dt><dd>{formatDateTime(inc.updatedAt)}</dd></div>
            </dl>
          </section>

          {permissions.canChangeStatus && (
            <StatusForm id={inc.id} current={inc.status} allowed={permissions.allowedStatuses}
                        onDone={(d) => { setDetail(d); notify('Statut mis à jour'); }} />
          )}

          {permissions.canAssign && (
            <AssignForm id={inc.id} current={inc.assignedTo} technicians={technicians}
                        onDone={(d) => { setDetail(d); notify('Incident affecté'); }} />
          )}

          {inc.status === 'CLOSED' && (
            <section className="card">
              <div className="locked"><Lock size={16} /> Incident clôturé : son statut ne peut plus être modifié.</div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function PersonLine({ user }) {
  return (
    <div className="person">
      <span className="avatar sm">{initials(user.fullName)}</span>
      <span className="meta"><b>{user.fullName}</b><span>{user.email}</span></span>
    </div>
  );
}

function StatusForm({ id, current, allowed, onDone }) {
  const { notify } = useToast();
  const [status, setStatus] = useState(allowed[0] || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setStatus(allowed[0] || ''); }, [allowed]);

  async function submit(e) {
    e.preventDefault();
    if (!status) return;
    setLoading(true);
    try {
      const d = await incidentService.updateStatus(id, status, note.trim());
      setNote('');
      onDone(d);
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card action-block" onSubmit={submit}>
      <div className="card-head" style={{ marginBottom: 0 }}><h2 className="h2"><Wrench size={16} /> Traitement</h2></div>
      <div className="field">
        <label className="label" htmlFor="status">Nouveau statut</label>
        <select id="status" className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {allowed.map((s) => <option key={s} value={s}>{current} → {s} · {STATUS[s].label}</option>)}
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="statusNote">Note (facultative)</label>
        <textarea id="statusNote" className="textarea" style={{ minHeight: 80 }} value={note}
                  placeholder="Ex. : Le poste a été isolé du réseau." onChange={(e) => setNote(e.target.value)} />
      </div>
      <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Mise à jour…' : 'Mettre à jour'}</button>
    </form>
  );
}

function AssignForm({ id, current, technicians, onDone }) {
  const { notify } = useToast();
  const [techId, setTechId] = useState('');
  const [loading, setLoading] = useState(false);
  const options = technicians.filter((t) => t.id !== current?.id);

  async function submit(e) {
    e.preventDefault();
    if (!techId) return;
    setLoading(true);
    try {
      onDone(await incidentService.assign(id, techId));
      setTechId('');
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card action-block" onSubmit={submit}>
      <div className="card-head" style={{ marginBottom: 0 }}>
        <h2 className="h2"><UserCog size={16} /> {current ? 'Réaffecter' : 'Affecter'}</h2>
      </div>
      <select className="select" value={techId} onChange={(e) => setTechId(e.target.value)}>
        <option value="">Choisir un technicien…</option>
        {options.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
      </select>
      <button className="btn btn-outline btn-block" disabled={!techId || loading}>
        {loading ? 'Affectation…' : 'Affecter'}
      </button>
    </form>
  );
}

function CommentForm({ id, onDone }) {
  const { notify } = useToast();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await incidentService.addComment(id, content.trim());
      setContent('');
      onDone();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 16 }} className="form">
      <textarea className="textarea" style={{ minHeight: 90 }} value={content} maxLength={2000}
                placeholder="Ajouter une note de traitement…" onChange={(e) => setContent(e.target.value)} />
      <div className="row">
        <span className="spacer" />
        <button className="btn btn-primary btn-sm" disabled={!content.trim() || loading}>
          <Send size={13} /> Ajouter la note
        </button>
      </div>
    </form>
  );
}
