'use client';

import { useRouter } from 'next/navigation';
import { CategoryTag, PriorityBadge, StatusBadge } from './Badges';
import { formatDateTime, initials } from '@/utils/format';

/**
 * Tableau d'incidents réutilisable.
 * columns : 'createdBy' et/ou 'assignedTo' pour afficher les personnes concernées.
 * renderActions : contenu facultatif d'une dernière colonne (ex. affectation rapide).
 */
export default function IncidentTable({ incidents, columns = [], renderActions }) {
  const router = useRouter();
  const show = (c) => columns.includes(c);

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Incident</th>
            <th>Catégorie</th>
            <th>Priorité</th>
            <th>Statut</th>
            {show('createdBy') && <th>Déclaré par</th>}
            {show('assignedTo') && <th>Technicien</th>}
            <th>Mis à jour</th>
            {renderActions && <th />}
          </tr>
        </thead>
        <tbody>
          {incidents.map((i) => (
            <tr key={i.id} className="clickable" onClick={() => router.push(`/incidents/${i.id}`)}>
              <td className="id-cell">#{i.id}</td>
              <td>
                <div className="title-cell">
                  <b>{i.title}</b>
                  <span>Créé le {formatDateTime(i.createdAt)}</span>
                </div>
              </td>
              <td><CategoryTag category={i.category} /></td>
              <td><PriorityBadge priority={i.priority} /></td>
              <td><StatusBadge status={i.status} /></td>
              {show('createdBy') && <td><Person user={i.createdBy} /></td>}
              {show('assignedTo') && (
                <td>{i.assignedTo ? <Person user={i.assignedTo} /> : <span className="faint small">Non affecté</span>}</td>
              )}
              <td className="small muted">{formatDateTime(i.updatedAt)}</td>
              {renderActions && <td onClick={(e) => e.stopPropagation()}>{renderActions(i)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Person({ user }) {
  if (!user) return null;
  return (
    <div className="person">
      <span className="avatar sm">{initials(user.fullName)}</span>
      <span className="small">{user.fullName}</span>
    </div>
  );
}
