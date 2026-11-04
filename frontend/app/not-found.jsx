import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container forbidden">
      <div className="code">404</div>
      <p className="eyebrow" style={{ marginTop: 18 }}>Page introuvable</p>
      <p className="lead" style={{ margin: '12px auto 28px' }}>Cette adresse ne correspond à aucune page.</p>
      <Link href="/" className="btn btn-primary">Retour à l’accueil</Link>
    </div>
  );
}
