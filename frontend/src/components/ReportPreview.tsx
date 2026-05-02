import { DoughnutChart } from "./DoughnutChart";
import { MetricCard } from "./MetricCard";
import { PublicationCard } from "./PublicationCard";
import { SectionTitle } from "./SectionTitle";
import { ReportData } from "../types/report";
import { platformPills, sanitizeReport } from "../utils/reportHelpers";

interface ReportPreviewProps {
  data: ReportData;
}

export function ReportPreview({ data }: ReportPreviewProps) {
  const report = sanitizeReport(data);
  const pills = platformPills(report.plataforma);

  return (
    <div className="preview-stack">
      <section className="report-page">
        <header className="report-header">
          <div>
            <p className="section-title">Balance de Redes Sociales</p>
            <h1 className="report-account">{report.cuenta || "Cuenta sin definir"}</h1>
          </div>
          <div className="report-period-box">
            <p className="eyebrow">Período</p>
            <h2 className="report-period">{report.periodo || "Mes sin definir"}</h2>
            <div className="pill-row">
              {pills.map((pill) => (
                <span className="platform-pill" key={pill}>
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="divider" />

        <SectionTitle>Métricas Generales</SectionTitle>
        <div className="metrics-grid">
          <MetricCard label="Visualizaciones" value={report.datosGenerales.visualizaciones} helper="total del período" accent="green" />
          <MetricCard label="Interacciones" value={report.datosGenerales.interacciones} helper="likes · comentarios · shares" accent="blue" />
          <MetricCard label="Cuentas alcanzadas" value={report.datosGenerales.cuentasAlcanzadas} helper="personas únicas" accent="gray" />
          <MetricCard label="Nuevos seguidores" value={report.datosGenerales.nuevosSeguidores} helper="crecimiento orgánico" accent="orange" />
          <MetricCard
            label="Seguidores vs. no seguidores"
            value={`${report.datosGenerales.porcentajeSeguidores || "—"} / ${report.datosGenerales.porcentajeNoSeguidores || "—"}`}
            helper={report.datosGenerales.variacionCuentasAlcanzadasVsMesAnterior}
            accent="pink"
          />
        </div>

        {report.topPublicaciones.length ? (
          <>
            <SectionTitle>Top Publicaciones</SectionTitle>
            <div className="top-publications-strip">
              {report.topPublicaciones.slice(0, 3).map((publicacion) => (
                <article className="top-publication-teaser" key={`teaser-${publicacion.orden}-${publicacion.titulo}`}>
                  <span>{String(publicacion.orden).padStart(2, "0")}</span>
                  <div>
                    <strong>{publicacion.tipo || "Publicación"}</strong>
                    <p>{publicacion.titulo || "Sin título"}</p>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section className="report-page">
        {report.topPublicaciones.length ? (
          <>
            <div className="publication-list">
              {report.topPublicaciones.slice(0, 3).map((publicacion) => (
                <PublicationCard publicacion={publicacion} key={`${publicacion.orden}-${publicacion.titulo}`} />
              ))}
            </div>
            <SectionTitle>Audiencia</SectionTitle>
          </>
        ) : (
          <SectionTitle>Audiencia</SectionTitle>
        )}

        <div className="audience-grid">
          {report.audiencia.ubicaciones.length ? (
            <article className="info-card">
              <p className="eyebrow">Ubicaciones</p>
              <div className="info-list">
                {report.audiencia.ubicaciones.map((item, index) => (
                  <div className="info-row" key={`${item.nombre}-${index}`}>
                    <span>{item.nombre || "Sin ubicación"}</span>
                    <strong>{item.porcentaje || "—"}</strong>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
          {report.audiencia.edades.length ? (
            <article className="info-card">
              <p className="eyebrow">Rango etario</p>
              <div className="info-list">
                {report.audiencia.edades.map((item, index) => (
                  <div className="info-row" key={`${item.rango}-${index}`}>
                    <span>{item.rango || "Sin rango"}</span>
                    <strong>{item.porcentaje || "—"}</strong>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </div>

        {(report.audiencia.genero.mujeres || report.audiencia.genero.hombres) ? (
          <>
            <SectionTitle>Género</SectionTitle>
            <article className="gender-card">
              <DoughnutChart mujeres={report.audiencia.genero.mujeres} hombres={report.audiencia.genero.hombres} />
              <div className="gender-stats">
                <div>
                  <span>Mujeres</span>
                  <strong className="accent-pink">{report.audiencia.genero.mujeres || "—"}</strong>
                </div>
                <div>
                  <span>Hombres</span>
                  <strong className="accent-blue">{report.audiencia.genero.hombres || "—"}</strong>
                </div>
              </div>
            </article>
          </>
        ) : null}
      </section>

      <section className="report-page">
        <SectionTitle>Insights Adicionales</SectionTitle>
        {report.insightsAdicionales.length ? (
          <div className={`insights-grid insights-${Math.min(report.insightsAdicionales.length, 4)}`}>
            {report.insightsAdicionales.map((insight, index) => (
              <article className="insight-card" key={`${insight}-${index}`}>
                <span className="insight-icon">{["✦", "▣", "◌", "★"][index] || "✦"}</span>
                <p>{insight}</p>
              </article>
            ))}
          </div>
        ) : (
          <article className="empty-card">No hay insights cargados para este período.</article>
        )}

        <footer className="report-footer">
          <span>{report.cuenta || "Cuenta"}</span>
          <span>{report.periodo || "Período"}</span>
          <span>{pills.join(" · ")}</span>
          <span>{report.datosGenerales.publicaciones || "0"} publicaciones</span>
        </footer>
      </section>

      <section className="report-page">
        <SectionTitle>Sugerencias para el Próximo Mes</SectionTitle>
        {report.sugerenciasProximoMes.length ? (
          <div className="suggestions-list">
            {report.sugerenciasProximoMes.map((suggestion, index) => (
              <article className="suggestion-card" key={`${suggestion}-${index}`}>
                <span className="suggestion-step">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="eyebrow">Recomendación</p>
                  <p className="suggestion-copy">{suggestion}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <article className="empty-card">No hay sugerencias cargadas para el próximo mes.</article>
        )}

        <footer className="report-footer">
          <span>{report.cuenta || "Cuenta"}</span>
          <span>Plan de acción</span>
          <span>{pills.join(" · ")}</span>
          <span>{report.sugerenciasProximoMes.length} sugerencias</span>
        </footer>
      </section>
    </div>
  );
}
