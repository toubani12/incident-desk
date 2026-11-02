'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CircleAlert, Clock, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/services/api';

/** Comptes créés au démarrage du backend (voir README) — pratique pour la démonstration. */
const DEMO = [
  { label: 'Admin', email: 'admin@incident.ma', password: 'Admin@123' },
  { label: 'Technicien', email: 'tech1@incident.ma', password: 'Tech@1234' },
  { label: 'Employé', email: 'badr@incident.ma', password: 'Employe@123' },
];

export default function Login() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [next, setNext] = useState('/dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setExpired(params.get('expired') === '1');
    const n = params.get('next');
    if (n && n.startsWith('/') && !n.startsWith('//')) setNext(n);
  }, []);

  useEffect(() => {
    if (ready && user && !expired) router.replace('/dashboard');
  }, [ready, user, expired, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email et mot de passe obligatoires');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err, 'Connexion impossible'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container auth">
      <div className="card auth-card">
        <p className="eyebrow">Espace sécurisé</p>
        <h1 className="h1">Connexion</h1>
        <p className="muted small" style={{ margin: '8px 0 24px' }}>
          Connectez-vous pour déclarer ou traiter des incidents.
        </p>

        {expired && (
          <div className="alert alert-warn" style={{ marginBottom: 18 }}>
            <Clock size={17} />
            <span>Votre session a expiré. Veuillez vous reconnecter.</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 18 }}>
            <CircleAlert size={17} />
            <span>{error}</span>
          </div>
        )}

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <div className="input-wrap">
              <Mail size={16} className="icon-left" />
              <input id="email" className="input" type="email" autoComplete="email"
                     placeholder="prenom@entreprise.ma" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="password">Mot de passe</label>
            <div className="input-wrap">
              <Lock size={16} className="icon-left" />
              <input id="password" className="input" type={showPwd ? 'text' : 'password'} autoComplete="current-password"
                     placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="icon-right" onClick={() => setShowPwd((s) => !s)}
                      aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-lg btn-block" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Connexion…' : <>Se connecter <ArrowRight size={15} /></>}
          </button>
        </form>

        <hr className="divider" />
        <p className="label" style={{ marginBottom: 10 }}>Comptes de démonstration</p>
        <div className="demo-accounts">
          {DEMO.map((d) => (
            <button key={d.email} type="button" className="btn btn-ghost btn-sm"
                    onClick={() => { setEmail(d.email); setPassword(d.password); setError(''); }}>
              {d.label}
            </button>
          ))}
        </div>

        <p className="small muted" style={{ marginTop: 22, textAlign: 'center' }}>
          Pas encore de compte ? <Link href="/register" className="link">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
