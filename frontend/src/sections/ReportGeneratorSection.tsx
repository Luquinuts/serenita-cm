import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ReportPreview } from "../components/ReportPreview";
import { ReportData } from "../types/report";
import { createPublication, EMPTY_REPORT, hydrateReportData } from "../utils/reportHelpers";
import { reportSchema } from "../utils/schema";
import { loadReportFromStorage, saveReportToStorage } from "../utils/storage";

import { supabase } from "../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL ?? `${window.location.protocol}//${window.location.hostname}:8000`;

const platformOptions = ["Instagram", "Facebook", "TikTok", "LinkedIn", "X", "YouTube", "Otra"];
const typeOptions = ["Reel", "Carrusel", "Placa", "Post", "Video", "Historia", "Otro"];

type Errors = Record<string, string>;

type ApiValidationDetail = {
  loc?: Array<string | number>;
  msg?: string;
};

type ReportGeneratorSectionProps = {
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

export function ReportGeneratorSection({ userId }: ReportGeneratorSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<ReportData>(() => hydrateReportData(loadReportFromStorage() ?? sampleReport));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<string>("Listo para generar el balance.");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    saveReportToStorage(formData);
  }, [formData]);

  const previewData = useMemo(() => formData, [formData]);

  function updateField<K extends keyof ReportData>(key: K, value: ReportData[K]) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function updateDatosGenerales(key: keyof ReportData["datosGenerales"], value: string) {
    setFormData((current) => ({
      ...current,
      datosGenerales: {
        ...current.datosGenerales,
        [key]: value,
      },
    }));
  }

  function updateTopPublicacion(index: number, key: "tipo" | "titulo" | "orden", value: string | number) {
    setFormData((current) => ({
      ...current,
      topPublicaciones: current.topPublicaciones.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function updateMetrica(publicacionIndex: number, metricaIndex: number, key: "label" | "valor", value: string) {
    setFormData((current) => ({
      ...current,
      topPublicaciones: current.topPublicaciones.map((publicacion, pIndex) =>
        pIndex === publicacionIndex
          ? {
              ...publicacion,
              metricas: publicacion.metricas.map((metrica, mIndex) =>
                mIndex === metricaIndex ? { ...metrica, [key]: value } : metrica,
              ),
            }
          : publicacion,
      ),
    }));
  }

  function addMetrica(publicacionIndex: number) {
    setFormData((current) => ({
      ...current,
      topPublicaciones: current.topPublicaciones.map((publicacion, index) =>
        index === publicacionIndex
          ? {
              ...publicacion,
              metricas: [...publicacion.metricas, { label: "", valor: "" }],
            }
          : publicacion,
      ),
    }));
  }

  function removeMetrica(publicacionIndex: number, metricaIndex: number) {
    setFormData((current) => ({
      ...current,
      topPublicaciones: current.topPublicaciones.map((publicacion, index) =>
        index === publicacionIndex
          ? {
              ...publicacion,
              metricas: publicacion.metricas.filter((_, innerIndex) => innerIndex !== metricaIndex),
            }
          : publicacion,
      ),
    }));
  }

  function addPublicacion() {
    setFormData((current) => ({
      ...current,
      topPublicaciones: [...current.topPublicaciones, createPublication(current.topPublicaciones.length + 1)],
    }));
  }

  function removePublicacion(index: number) {
    setFormData((current) => ({
      ...current,
      topPublicaciones: current.topPublicaciones
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, orden: itemIndex + 1 })),
    }));
  }

  function updateUbicacion(index: number, key: "nombre" | "porcentaje", value: string) {
    setFormData((current) => ({
      ...current,
      audiencia: {
        ...current.audiencia,
        ubicaciones: current.audiencia.ubicaciones.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [key]: value } : item,
        ),
      },
    }));
  }

  function updateEdad(index: number, key: "rango" | "porcentaje", value: string) {
    setFormData((current) => ({
      ...current,
      audiencia: {
        ...current.audiencia,
        edades: current.audiencia.edades.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [key]: value } : item,
        ),
      },
    }));
  }

  function addUbicacion() {
    setFormData((current) => ({
      ...current,
      audiencia: {
        ...current.audiencia,
        ubicaciones: [...current.audiencia.ubicaciones, { nombre: "", porcentaje: "" }],
      },
    }));
  }

  function addEdad() {
    setFormData((current) => ({
      ...current,
      audiencia: {
        ...current.audiencia,
        edades: [...current.audiencia.edades, { rango: "", porcentaje: "" }],
      },
    }));
  }

  function removeUbicacion(index: number) {
    setFormData((current) => ({
      ...current,
      audiencia: {
        ...current.audiencia,
        ubicaciones: current.audiencia.ubicaciones.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  }

  function removeEdad(index: number) {
    setFormData((current) => ({
      ...current,
      audiencia: {
        ...current.audiencia,
        edades: current.audiencia.edades.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  }

  function updateGenero(key: "mujeres" | "hombres", value: string) {
    setFormData((current) => ({
      ...current,
      audiencia: {
        ...current.audiencia,
        genero: {
          ...current.audiencia.genero,
          [key]: value,
        },
      },
    }));
  }

  function updateInsight(index: number, value: string) {
    setFormData((current) => ({
      ...current,
      insightsAdicionales: current.insightsAdicionales.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function addInsight() {
    setFormData((current) => ({
      ...current,
      insightsAdicionales: [...current.insightsAdicionales, ""],
    }));
  }

  function removeInsight(index: number) {
    setFormData((current) => ({
      ...current,
      insightsAdicionales: current.insightsAdicionales.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateSuggestion(index: number, value: string) {
    setFormData((current) => ({
      ...current,
      sugerenciasProximoMes: current.sugerenciasProximoMes.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function addSuggestion() {
    setFormData((current) => ({
      ...current,
      sugerenciasProximoMes: [...current.sugerenciasProximoMes, ""],
    }));
  }

  function removeSuggestion(index: number) {
    setFormData((current) => ({
      ...current,
      sugerenciasProximoMes: current.sugerenciasProximoMes.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function validateCurrentData(data: ReportData): boolean {
    const parsed = reportSchema.safeParse(data);
    if (parsed.success) {
      setErrors({});
      return true;
    }

    const nextErrors: Errors = {};
    parsed.error.issues.forEach((issue) => {
      nextErrors[issue.path.join(".")] = issue.message;
    });
    setErrors(nextErrors);
    setStatus("Hay campos que necesitan revision antes de generar el PDF.");
    return false;
  }

  async function generatePdf() {
    if (!validateCurrentData(formData)) {
      return;
    }

    setIsGenerating(true);
    setStatus("Generando PDF...");

    try {
      const response = await fetch(`${API_URL}/api/report/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(formatApiError(errorData?.detail));
      }

      const blob = await response.blob();
      await saveReportRecord(formData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `serenita-cm-${formData.cuenta || "reporte"}-${formData.periodo || "mensual"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("PDF generado correctamente y guardado en el historial.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrio un error al generar el PDF.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveReportRecord(data: ReportData) {
    const title = `${data.cuenta || "Reporte"} - ${data.periodo || "Mensual"}`;
    const { error } = await supabase.from("reports").insert({
      user_id: userId,
      title,
      payload: data,
    });

    if (error) {
      setStatus("El PDF se genero, pero no se pudo guardar en el historial.");
      return;
    }
  }

  function clearForm() {
    setFormData(EMPTY_REPORT);
    setErrors({});
    setStatus("Formulario limpio.");
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "serenita-cm-reporte.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("JSON descargado.");
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = hydrateReportData(JSON.parse(String(reader.result)) as Partial<ReportData>);
        if (!validateCurrentData(parsed)) {
          setStatus("El archivo JSON no coincide con el esquema esperado.");
          return;
        }
        setFormData(parsed);
        setStatus("JSON importado correctamente.");
      } catch {
        setStatus("No se pudo leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function openImportDialog() {
    fileInputRef.current?.click();
  }

  return (
    <div className="generator-layout">
      <aside className="panel panel-form">
        <div className="brand-block">
          <p className="brand-kicker">Modulo activo</p>
          <h1>Generador editorial de balances mensuales</h1>
          <p>Carga datos, ajusta el contenido y exporta un PDF listo para presentar.</p>
        </div>

        <div className="toolbar">
          <button type="button" className="button button-ghost" onClick={clearForm}>
            Limpiar
          </button>
          <button type="button" className="button button-ghost" onClick={downloadJson}>
            Descargar JSON
          </button>
          <button type="button" className="button button-ghost" onClick={openImportDialog}>
            Importar JSON
          </button>
          <button type="button" className="button button-primary" onClick={generatePdf} disabled={isGenerating}>
            {isGenerating ? "Generando..." : "Generar PDF"}
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={importJson} />
        </div>

        <p className="status-line">{status}</p>

        <div className="form-section">
          <h2>Datos base</h2>
          <div className="field-grid">
            <label className="field">
              <span>Periodo</span>
              <input value={formData.periodo} onChange={(event) => updateField("periodo", event.target.value)} placeholder="abril" />
              {errors.periodo ? <small>{errors.periodo}</small> : null}
            </label>
            <label className="field">
              <span>Cuenta</span>
              <input value={formData.cuenta} onChange={(event) => updateField("cuenta", event.target.value)} placeholder="@serenita" />
              {errors.cuenta ? <small>{errors.cuenta}</small> : null}
            </label>
            <label className="field">
              <span>Plataforma</span>
              <select value={formData.plataforma} onChange={(event) => updateField("plataforma", event.target.value)}>
                {platformOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.plataforma ? <small>{errors.plataforma}</small> : null}
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2>Datos generales</h2>
          <div className="field-grid field-grid-two">
            {(
              [
                ["visualizaciones", "Visualizaciones"],
                ["interacciones", "Interacciones"],
                ["cuentasAlcanzadas", "Cuentas alcanzadas"],
                ["nuevosSeguidores", "Nuevos seguidores"],
                ["publicaciones", "Publicaciones"],
                ["porcentajeSeguidores", "% seguidores"],
                ["porcentajeNoSeguidores", "% no seguidores"],
                ["variacionCuentasAlcanzadasVsMesAnterior", "Variacion vs. mes anterior"],
              ] as const
            ).map(([key, label]) => (
              <label className="field" key={key}>
                <span>{label}</span>
                <input
                  value={formData.datosGenerales[key]}
                  onChange={(event) => updateDatosGenerales(key, event.target.value)}
                  placeholder={label}
                />
                {errors[`datosGenerales.${key}`] ? <small>{errors[`datosGenerales.${key}`]}</small> : null}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-heading">
            <h2>Top publicaciones</h2>
            <button type="button" className="button button-ghost small" onClick={addPublicacion}>
              Agregar publicacion
            </button>
          </div>
          <div className="stack-list">
            {formData.topPublicaciones.map((publicacion, publicacionIndex) => (
              <div className="nested-card" key={`publicacion-${publicacionIndex}`}>
                <div className="section-heading">
                  <strong>Publicacion {publicacionIndex + 1}</strong>
                  <button type="button" className="button button-ghost small" onClick={() => removePublicacion(publicacionIndex)}>
                    Quitar
                  </button>
                </div>
                <div className="field-grid field-grid-three">
                  <label className="field">
                    <span>Orden</span>
                    <input
                      type="number"
                      value={publicacion.orden}
                      onChange={(event) => updateTopPublicacion(publicacionIndex, "orden", Number(event.target.value))}
                    />
                  </label>
                  <label className="field">
                    <span>Tipo</span>
                    <select value={publicacion.tipo} onChange={(event) => updateTopPublicacion(publicacionIndex, "tipo", event.target.value)}>
                      {typeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field field-wide">
                    <span>Titulo</span>
                    <input value={publicacion.titulo} onChange={(event) => updateTopPublicacion(publicacionIndex, "titulo", event.target.value)} />
                  </label>
                </div>

                <div className="section-heading compact">
                  <strong>Metricas</strong>
                  <button type="button" className="button button-ghost small" onClick={() => addMetrica(publicacionIndex)}>
                    Agregar metrica
                  </button>
                </div>

                <div className="stack-list">
                  {publicacion.metricas.map((metrica, metricaIndex) => (
                    <div className="inline-fields" key={`metrica-${metricaIndex}`}>
                      <label className="field">
                        <span>Label</span>
                        <input value={metrica.label} onChange={(event) => updateMetrica(publicacionIndex, metricaIndex, "label", event.target.value)} />
                      </label>
                      <label className="field">
                        <span>Valor</span>
                        <input value={metrica.valor} onChange={(event) => updateMetrica(publicacionIndex, metricaIndex, "valor", event.target.value)} />
                      </label>
                      <button type="button" className="button button-ghost small align-end" onClick={() => removeMetrica(publicacionIndex, metricaIndex)}>
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Audiencia</h2>
          <div className="section-heading compact">
            <strong>Ubicaciones</strong>
            <button type="button" className="button button-ghost small" onClick={addUbicacion}>
              Agregar
            </button>
          </div>
          <div className="stack-list">
            {formData.audiencia.ubicaciones.map((ubicacion, index) => (
              <div className="inline-fields" key={`ubicacion-${index}`}>
                <label className="field">
                  <span>Nombre</span>
                  <input value={ubicacion.nombre} onChange={(event) => updateUbicacion(index, "nombre", event.target.value)} />
                </label>
                <label className="field">
                  <span>Porcentaje</span>
                  <input value={ubicacion.porcentaje} onChange={(event) => updateUbicacion(index, "porcentaje", event.target.value)} />
                </label>
                <button type="button" className="button button-ghost small align-end" onClick={() => removeUbicacion(index)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <div className="section-heading compact top-gap">
            <strong>Rango etario</strong>
            <button type="button" className="button button-ghost small" onClick={addEdad}>
              Agregar
            </button>
          </div>
          <div className="stack-list">
            {formData.audiencia.edades.map((edad, index) => (
              <div className="inline-fields" key={`edad-${index}`}>
                <label className="field">
                  <span>Rango</span>
                  <input value={edad.rango} onChange={(event) => updateEdad(index, "rango", event.target.value)} />
                </label>
                <label className="field">
                  <span>Porcentaje</span>
                  <input value={edad.porcentaje} onChange={(event) => updateEdad(index, "porcentaje", event.target.value)} />
                </label>
                <button type="button" className="button button-ghost small align-end" onClick={() => removeEdad(index)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <div className="field-grid field-grid-two top-gap">
            <label className="field">
              <span>Mujeres</span>
              <input value={formData.audiencia.genero.mujeres} onChange={(event) => updateGenero("mujeres", event.target.value)} placeholder="54,1%" />
            </label>
            <label className="field">
              <span>Hombres</span>
              <input value={formData.audiencia.genero.hombres} onChange={(event) => updateGenero("hombres", event.target.value)} placeholder="45,9%" />
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="section-heading">
            <h2>Insights adicionales</h2>
            <button type="button" className="button button-ghost small" onClick={addInsight}>
              Agregar insight
            </button>
          </div>
          <div className="stack-list">
            {formData.insightsAdicionales.map((insight, index) => (
              <div className="inline-fields" key={`insight-${index}`}>
                <label className="field field-wide">
                  <span>Insight {index + 1}</span>
                  <textarea value={insight} onChange={(event) => updateInsight(index, event.target.value)} rows={3} />
                </label>
                <button type="button" className="button button-ghost small align-end" onClick={() => removeInsight(index)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-heading">
            <h2>Sugerencias para el proximo mes</h2>
            <button type="button" className="button button-ghost small" onClick={addSuggestion}>
              Agregar sugerencia
            </button>
          </div>
          <div className="stack-list">
            {formData.sugerenciasProximoMes.map((suggestion, index) => (
              <div className="inline-fields" key={`suggestion-${index}`}>
                <label className="field field-wide">
                  <span>Sugerencia {index + 1}</span>
                  <textarea value={suggestion} onChange={(event) => updateSuggestion(index, event.target.value)} rows={3} />
                </label>
                <button type="button" className="button button-ghost small align-end" onClick={() => removeSuggestion(index)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="panel panel-preview">
        <div className="preview-header">
          <div>
            <p className="brand-kicker">Preview</p>
            <h2>Vista editorial del reporte</h2>
          </div>
          <p>La previsualizacion conserva la estructura final del PDF, con layout adaptable para campos vacios.</p>
        </div>
        <ReportPreview data={previewData} />
      </main>
    </div>
  );
}
