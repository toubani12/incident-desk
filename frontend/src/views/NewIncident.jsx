'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CircleAlert, Send } from 'lucide-react';
import incidentService from '@/services/incidentService';
import { errorMessage, fieldErrors } from '@/services/api';
import { useToast } from '@/components/Toast';
import { CATEGORY, CATEGORY_KEYS, PRIORITY, PRIORITY_KEYS } from '@/utils/labels';

export default function NewIncident() {
  const router = useRouter();
  const { notify } = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (form.title.trim().length < 5) e.title = 'Le titre doit contenir au moins 5 caractères';
    if (form.description.trim().length < 10) e.description = 'Décrivez le problème (10 caractères minimum)';
    if (!form.category) e.category = 'Choisissez une catégorie';
    if (!form.priority) e.priority = 'Choisissez une priorité';
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
      const created = await incidentService.create({
        title: form.title.trim(), description: form.description.trim(),
        category: form.category, priority: form.priority,
      });
      notify(`Incident #${created.id} déclaré`);
      router.push(`/incidents/${created.id}`);
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 920 }}>
      <Link href="/incidents" className="back-link"><ArrowLeft size={14} /> Mes incidents</Link>
      <div className="page-head" style={{ marginTop: 12 }}>
        <div>
          <p className="eyebrow">Nouveau ticket</p>
          <h1 className="h1">Déclarer un incident</h1>
          <p className="lead">Plus la description est précise, plus le traitement sera rapide.</p>
        </div>
      </div>

      <form className="card form" onSubmit={onSubmit} noValidate>
        {error && <div className="alert alert-error"><CircleAlert size={16} /><span>{error}</span></div>}

        <div className="field">
          <label className="label" htmlFor="title">Titre</label>
          <input id="title" className={`input ${errors.title ? 'invalid' : ''}`} maxLength={150}
                 placeholder="Ex. : Poste infecté par un malware" value={form.title}
                 onChange={(e) => setForm({ ...form, title: e.target.value })} />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="field">
          <label className="label">Catégorie</label>
          <div className="tiles">
            {CATEGORY_KEYS.map((k) => {
              const { label, icon: Icon, hint } = CATEGORY[k];
              return (
                <button type="button" key={k} className={`tile ${form.category === k ? 'selected' : ''}`}
                        onClick={() => setForm({ ...form, category: k })}>
                  <Icon size={18} />
                  <span style={{ fontWeight: 500 }}>{label}</span>
                  <span className="faint" style={{ fontSize: 11 }}>{hint}</span>
                </button>
              );
            })}
          </div>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>

        <div className="field">
          <label className="label">Priorité</label>
          <div className="segmented">
            {PRIORITY_KEYS.map((k) => (
              <button type="button" key={k} className={`seg ${form.priority === k ? 'selected' : ''}`}
                      style={{ '--seg-color': PRIORITY[k].color }} onClick={() => setForm({ ...form, priority: k })}>
                <span className="dot" /> {PRIORITY[k].label}
              </button>
            ))}
          </div>
          {errors.priority && <span className="field-error">{errors.priority}</span>}
        </div>

        <div className="field">
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className={`textarea ${errors.description ? 'invalid' : ''}`} maxLength={3000}
                    placeholder="Que s’est-il passé ? Depuis quand ? Quel poste, quel logiciel, quel message d’erreur ?"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="row">
            {errors.description && <span className="field-error">{errors.description}</span>}
            <span className="spacer" />
            <span className="field-hint">{form.description.length} / 3000</span>
          </div>
        </div>

        <div className="row">
          <span className="spacer" />
          <Link href="/incidents" className="btn btn-ghost">Annuler</Link>
          <button className="btn btn-primary" disabled={loading}>
            <Send size={15} /> {loading ? 'Envoi…' : 'Déclarer'}
          </button>
        </div>
      </form>
    </div>
  );
}
