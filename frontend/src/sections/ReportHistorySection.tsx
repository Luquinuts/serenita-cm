import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ReportData } from "../types/report";
import { hydrateReportData } from "../utils/reportHelpers";

const API_URL =
  import.meta.env.VITE_API_URL ?? `${window.location.protocol}//${window.location.hostname}:8000`;

type ApiValidationDetail = {
  loc?: Array<string | number>;
  msg?: string;
};

type ReportRecord = {
  id: string;
  title: string | null;
  payload: ReportData;
  created_at: string;
};

type ReportHistorySectionProps = {
  userId: string;
};

function formatApiError(detail: unknown): string {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const typedItem = item as ApiValidationDetail;
        const path = Array.isArray(typedItem.loc) ? typedItem.loc.slice(1).join(".") : "";
        const message = typedItem.msg?.trim();

        if (!message) {
          return null;
        }

        return path ? `${path}: ${message}` : message;
      })
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return "No se pudo generar el PDF.";
}

export function ReportHistorySection({ userId }: ReportHistorySectionProps) {
  const [reportHistory, setReportHistory] = useState<ReportRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyStatus, setHistoryStatus] = useState("");
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  useEffect(() => {
    void loadReportHistory();
  }, [userId]);

  async function loadReportHistory() {
    setIsHistoryLoading(true);
    setHistoryStatus("");

    const { data, error } = await supabase
      .from("reports")
      .select("id,title,payload,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    setIsHistoryLoading(false);

    if (error) {
      setHistoryStatus("No se pudo cargar el historial.");
      return;
    }

    setReportHistory((data ?? []).map((item) => ({ ...item, payload: hydrateReportData(item.payload) })));
  }

  async function downloadHistoricalReport(record: ReportRecord) {
    setDownloadingReportId(record.id);
    setHistoryStatus("Preparando descarga...");

    try {
      const response = await fetch(`${API_URL}/api/report/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record.payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(formatApiError(errorData?.detail));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `serenita-cm-${record.payload.cuenta || "reporte"}-${record.payload.periodo || "mensual"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setHistoryStatus("Reporte descargado.");
    } catch (error) {
      setHistoryStatus(error instanceof Error ? error.message : "No se pudo redescargar el reporte.");
    } finally {
      setDownloadingReportId(null);
    }
  }

  return (
    <section className="panel workspace-content-panel">
      <div className="section-heading">
        <div>
          <p className="brand-kicker">Registro</p>
          <h1 className="workspace-title">Historial de reportes</h1>
          <p className="workspace-copy">Consulta y vuelve a descargar los PDFs generados anteriormente.</p>
        </div>
        <button type="button" className="button button-ghost" onClick={loadReportHistory} disabled={isHistoryLoading}>
          {isHistoryLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {historyStatus ? <p className="status-line">{historyStatus}</p> : null}

      {reportHistory.length > 0 ? (
        <div className="history-list history-list-large">
          {reportHistory.map((record) => (
            <article className="history-card history-card-large" key={record.id}>
              <div>
                <strong>{record.title ?? "Reporte sin titulo"}</strong>
                <span>
                  {new Date(record.created_at).toLocaleDateString("es-AR")} · {record.payload.plataforma}
                </span>
              </div>
              <div className="history-actions">
                <button
                  type="button"
                  className="button button-secondary small"
                  onClick={() => downloadHistoricalReport(record)}
                  disabled={downloadingReportId === record.id}
                >
                  {downloadingReportId === record.id ? "Descargando..." : "Descargar PDF"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="history-empty">
          {isHistoryLoading ? "Buscando reportes guardados..." : "Todavia no hay reportes guardados para este usuario."}
        </p>
      )}
    </section>
  );
}
