'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CircleAlert, Info, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { errorMessage, fieldErrors } from '@/services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e = {};
    if (form.fullName.trim().length < 3) e.fullName = 'Au moins 3 caractères';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Email invalide';
    if (form.password.length < 8) e.password = 'Au moins 8 caractères';
    if (form.confirm !== form.password) e.confirm = 'Les mots de passe ne correspondent pas';
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await register(form.fullName.trim(), form.email.trim(), form.password);
      router.replace('/dashboard');
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err, 'Inscription impossible'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container auth">
      <div className="card auth-card">
        <p className="eyebrow">Nouveau compte</p>
        <h1 className="h1">Inscription</h1>
        <p className="muted small" style={{ margin: '8px 0 20px' }}>Créez votre accès pour déclarer des incidents.</p>

        <div className="alert alert-info" style={{ marginBottom: 18 }}>
          <Info size={16} />
          <span>Le rôle <b>EMPLOYEE</b> est attribué automatiquement. Seul un administrateur peut le modifier.</span>
        </div>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 18 }}>
            <CircleAlert size={17} /><span>{error}</span>
          </div>
        )}

        <form className="form" onSubmit={onSubmit} noValidate>
          <Field id="fullName" label="Nom complet" icon={User} error={errors.fullName}>
            <input id="fullName" className={`input ${errors.fullName ? 'invalid' : ''}`} placeholder="Badr Eddine Toubani"
                   value={form.fullName} onChange={set('fullName')} autoComplete="name" />
          </Field>
          <Field id="email" label="Email" icon={Mail} error={errors.email}>
            <input id="email" type="email" className={`input ${errors.email ? 'invalid' : ''}`} placeholder="prenom@entreprise.ma"
                   value={form.email} onChange={set('email')} autoComplete="email" />
          </Field>
          <Field id="password" label="Mot de passe" icon={Lock} error={errors.password}>
            <input id="password" type="password" className={`input ${errors.password ? 'invalid' : ''}`} placeholder="8 caractères minimum"
                   value={form.password} onChange={set('password')} autoComplete="new-password" />
          </Field>
          <Field id="confirm" label="Confirmation" icon={Lock} error={errors.confirm}>
            <input id="confirm" type="password" className={`input ${errors.confirm ? 'invalid' : ''}`} placeholder="Répétez le mot de passe"
                   value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
          </Field>
          <button className="btn btn-primary btn-lg btn-block" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Création…' : <>Créer mon compte <ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="small muted" style={{ marginTop: 22, textAlign: 'center' }}>
          Déjà inscrit ? <Link href="/login" className="link">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ id, label, icon: Icon, error, children }) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <Icon size={16} className="icon-left" />
        {children}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
