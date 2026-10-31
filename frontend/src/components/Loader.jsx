import { LoaderCircle } from 'lucide-react';

export default function Loader({ label = 'Chargement…' }) {
  return (
    <div className="loader">
      <div className="row">
        <LoaderCircle className="spin" size={18} />
        <span className="small">{label}</span>
      </div>
    </div>
  );
}
