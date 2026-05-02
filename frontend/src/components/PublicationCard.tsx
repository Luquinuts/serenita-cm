import { TopPublicacion } from "../types/report";

interface PublicationCardProps {
  publicacion: TopPublicacion;
}

const accentCycle = ["blue", "pink", "orange", "green", "lavender"] as const;

export function PublicationCard({ publicacion }: PublicationCardProps) {
  const metricas = publicacion.metricas.slice(0, 5);

  return (
    <article className="publication-card">
      <div className="publication-order">{String(publicacion.orden).padStart(2, "0")}</div>
      <div className="publication-content">
        <p className="eyebrow">{publicacion.tipo || "Publicación"}</p>
        <h3 className="publication-title">{publicacion.titulo || "Sin título"}</h3>
        <div className={`publication-metrics columns-${Math.min(Math.max(metricas.length, 1), 5)}`}>
          {metricas.length ? (
            metricas.map((metrica, index) => (
              <div key={`${metrica.label}-${index}`} className={`publication-metric accent-${accentCycle[index]}`}>
                <strong>{metrica.valor || "—"}</strong>
                <span>{metrica.label || "Métrica"}</span>
              </div>
            ))
          ) : (
            <div className="publication-metric accent-gray">
              <strong>—</strong>
              <span>Sin métricas</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
