'use client';

import { useEffect, useState } from 'react';
import { CircleAlert, KeyRound, Save, UserCog } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import { errorMessage, fieldErrors } from '@/services/api';
import { useToast } from '@/components/Toast';
import Loader from '@/components/Loader';
import { RolePill } from '@/components/Badges';
import { ROLE } from '@/utils/labels';
import { formatDate, initials } from '@/utils/format';

export default function Profile() {
  const { updateUser } = useAuth();
  const { notify } = useToast();
  const [profile, setProfile] = useState(null);
  const [info, setInfo] = useState({ fullName: '', email: '' });
  const [infoErrors, setInfoErrors] = useState({});
  const [savingInfo, setSavingInfo] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdError, setPwdError] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    authService.getProfile().then((p) => {
      setProfile(p);
      setInfo({ fullName: p.fullName, email: p.email });
    }).catch((e) => notify(errorMessage(e), 'error'));
  }, [notify]);

  async function saveInfo(e) {
    e.preventDefault();
    setInfoErrors({});
    setSavingInfo(true);
    try {
      const res = await authService.updateProfile(info.fullName.trim(), info.email.trim());
      setProfile(res.user);
      updateUser({ fullName: res.user.fullName, email: res.user.email });
      notify(res.auth ? 'Profil mis à jour — nouveaux jetons émis pour le nouvel email' : 'Profil mis à jour');
    } catch (err) {
      setInfoErrors(fieldErrors(err));
      notify(errorMessage(err), 'error');
    } finally {
      setSavingInfo(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwdError('');
    const errs = {};
    if (!pwd.currentPassword) errs.currentPassword = 'Obligatoire';
    if (pwd.newPassword.length < 8) errs.newPassword = 'Au moins 8 caractères';
    if (pwd.confirmPassword !== pwd.newPassword) errs.confirmPassword = 'La confirmation ne correspond pas';
    setPwdErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingPwd(true);
    try {
      await authService.changePassword(pwd.currentPassword, pwd.newPassword, pwd.confirmPassword);
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notify('Mot de passe modifié');
    } catch (err) {
      const fe = fieldErrors(err);
      if (fe.confirmationMatching) fe.confirmPassword = fe.confirmationMatching;
      setPwdErrors(fe);
      setPwdError(errorMessage(err));
    } finally {
      setSavingPwd(false);
    }
  }

  if (!profile) return <Loader />;

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <p className="eyebrow">Compte</p>
          <h1 className="h1">Mon profil</h1>
        </div>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <form className="card form" onSubmit={saveInfo} noValidate>
            <div className="card-head" style={{ marginBottom: 2 }}>
              <h2 className="h2"><UserCog size={16} /> Informations</h2>
            </div>
            <div className="grid-2">
              <div className="field">
                <label className="label" htmlFor="fullName">Nom complet</label>
                <input id="fullName" className={`input ${infoErrors.fullName ? 'invalid' : ''}`} value={info.fullName}
                       onChange={(e) => setInfo({ ...info, fullName: e.target.value })} />
                {infoErrors.fullName && <span className="field-error">{infoErrors.fullName}</span>}
              </div>
              <div className="field">
                <label className="label" htmlFor="email">Email</label>
                <input id="email" type="email" className={`input ${infoErrors.email ? 'invalid' : ''}`} value={info.email}
                       onChange={(e) => setInfo({ ...info, email: e.target.value })} />
                {infoErrors.email && <span className="field-error">{infoErrors.email}</span>}
              </div>
            </div>
            <div className="row">
              <span className="spacer" />
              <button className="btn btn-primary" disabled={savingInfo}><Save size={15} /> Enregistrer</button>
            </div>
          </form>

          <form className="card form" onSubmit={savePassword} noValidate>
            <div className="card-head" style={{ marginBottom: 2 }}>
              <h2 className="h2"><KeyRound size={16} /> Changer le mot de passe</h2>
            </div>
            {pwdError && <div className="alert alert-error"><CircleAlert size={16} /><span>{pwdError}</span></div>}
            <PwdField id="currentPassword" label="Ancien mot de passe" value={pwd.currentPassword} error={pwdErrors.currentPassword}
                      onChange={(v) => setPwd({ ...pwd, currentPassword: v })} autoComplete="current-password" />
            <div className="grid-2">
              <PwdField id="newPassword" label="Nouveau mot de passe" value={pwd.newPassword} error={pwdErrors.newPassword}
                        onChange={(v) => setPwd({ ...pwd, newPassword: v })} />
              <PwdField id="confirmPassword" label="Confirmation" value={pwd.confirmPassword} error={pwdErrors.confirmPassword}
                        onChange={(v) => setPwd({ ...pwd, confirmPassword: v })} />
            </div>
            <div className="row">
              <span className="field-hint">L’ancien mot de passe est vérifié par le serveur (BCrypt).</span>
              <span className="spacer" />
              <button className="btn btn-outline" disabled={savingPwd}>Modifier</button>
            </div>
          </form>
        </div>

        <aside className="card">
          <div className="row" style={{ gap: 16, marginBottom: 20 }}>
            <span className="avatar lg">{initials(profile.fullName)}</span>
            <div>
              <div style={{ fontWeight: 500, fontSize: 16 }}>{profile.fullName}</div>
              <div className="muted small">{profile.email}</div>
            </div>
          </div>
          <dl className="info-list">
            <div><dt>Rôle</dt><dd><RolePill role={profile.role}>{ROLE[profile.role]}</RolePill></dd></div>
            <div><dt>Statut du compte</dt><dd>{profile.enabled ? 'Actif' : 'Désactivé'}</dd></div>
            <div><dt>Membre depuis</dt><dd>{formatDate(profile.createdAt)}</dd></div>
            <div><dt>Identifiant</dt><dd className="mono">#{profile.id}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function PwdField({ id, label, value, onChange, error, autoComplete = 'new-password' }) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} type="password" className={`input ${error ? 'invalid' : ''}`} value={value}
             autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
