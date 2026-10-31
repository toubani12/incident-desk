/** Petits graphiques en CSS pur (aucune librairie). */

export function Donut({ data, total, label = 'Total' }) {
  const sum = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const stops = sum === 0
    ? 'rgba(255,255,255,0.08) 0 100%'
    : data.map((d) => {
        const from = (acc / sum) * 100;
        acc += d.value;
        const to = (acc / sum) * 100;
        return `${d.color} ${from}% ${to}%`;
      }).join(', ');

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
        <div className="center">
          <div><b>{total ?? sum}</b><span>{label}</span></div>
        </div>
      </div>
      <div className="legend">
        {data.map((d) => (
          <div key={d.label} className="legend-row" style={{ '--sw': d.color }}>
            <span className="sw" /> {d.label}
            <span className="val">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Bars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bars">
      {data.map((d) => (
        <div key={d.label} className="bar-row">
          <span className="bar-label">{d.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(d.value / max) * 100}%`, '--bar': d.color }} />
          </div>
          <span className="bar-val">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
