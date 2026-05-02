interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  accent?: "green" | "blue" | "orange" | "pink" | "gray";
}

export function MetricCard({ label, value, helper, accent = "gray" }: MetricCardProps) {
  return (
    <article className={`metric-card accent-${accent}`}>
      <p className="eyebrow">{label}</p>
      <p className="metric-value">{value || "—"}</p>
      {helper ? <p className="metric-helper">{helper}</p> : null}
    </article>
  );
}
