import { ReportData, TopPublicacion } from "../types/report";

export const EMPTY_REPORT: ReportData = {
  periodo: "",
  cuenta: "",
  plataforma: "Instagram",
  datosGenerales: {
    visualizaciones: "",
    porcentajeSeguidores: "",
    porcentajeNoSeguidores: "",
    interacciones: "",
    nuevosSeguidores: "",
    publicaciones: "",
    cuentasAlcanzadas: "",
    variacionCuentasAlcanzadasVsMesAnterior: "",
  },
  topPublicaciones: [
    {
      orden: 1,
      tipo: "Reel",
      titulo: "",
      metricas: [
        { label: "Visualizaciones", valor: "" },
        { label: "Likes", valor: "" },
        { label: "Comentarios", valor: "" },
      ],
    },
    {
      orden: 2,
      tipo: "Carrusel",
      titulo: "",
      metricas: [
        { label: "Visualizaciones", valor: "" },
        { label: "Likes", valor: "" },
      ],
    },
    {
      orden: 3,
      tipo: "Placa",
      titulo: "",
      metricas: [{ label: "Visualizaciones", valor: "" }],
    },
  ],
  audiencia: {
    ubicaciones: [
      { nombre: "", porcentaje: "" },
      { nombre: "", porcentaje: "" },
    ],
    edades: [
      { rango: "", porcentaje: "" },
      { rango: "", porcentaje: "" },
    ],
    genero: {
      mujeres: "",
      hombres: "",
    },
  },
  insightsAdicionales: ["", ""],
  sugerenciasProximoMes: ["", ""],
};

export function createPublication(nextOrder: number): TopPublicacion {
  return {
    orden: nextOrder,
    tipo: "Post",
    titulo: "",
    metricas: [
      { label: "Visualizaciones", valor: "" },
      { label: "Likes", valor: "" },
    ],
  };
}

export function hydrateReportData(data?: Partial<ReportData> | null): ReportData {
  if (!data) {
    return structuredClone(EMPTY_REPORT);
  }

  return {
    periodo: data.periodo ?? EMPTY_REPORT.periodo,
    cuenta: data.cuenta ?? EMPTY_REPORT.cuenta,
    plataforma: data.plataforma ?? EMPTY_REPORT.plataforma,
    datosGenerales: {
      ...EMPTY_REPORT.datosGenerales,
      ...(data.datosGenerales ?? {}),
    },
    topPublicaciones: data.topPublicaciones ?? structuredClone(EMPTY_REPORT.topPublicaciones),
    audiencia: {
      ubicaciones: data.audiencia?.ubicaciones ?? structuredClone(EMPTY_REPORT.audiencia.ubicaciones),
      edades: data.audiencia?.edades ?? structuredClone(EMPTY_REPORT.audiencia.edades),
      genero: {
        ...EMPTY_REPORT.audiencia.genero,
        ...(data.audiencia?.genero ?? {}),
      },
    },
    insightsAdicionales: data.insightsAdicionales ?? [...EMPTY_REPORT.insightsAdicionales],
    sugerenciasProximoMes: data.sugerenciasProximoMes ?? [...EMPTY_REPORT.sugerenciasProximoMes],
  };
}

export function sanitizeReport(data: ReportData): ReportData {
  return {
    ...data,
    topPublicaciones: data.topPublicaciones
      .map((publicacion, index) => ({
        ...publicacion,
        orden: publicacion.orden || index + 1,
        metricas: publicacion.metricas
          .filter((metrica) => metrica.label.trim() || metrica.valor.trim())
          .slice(0, 5),
      }))
      .filter((publicacion) => publicacion.titulo.trim() || publicacion.metricas.length > 0),
    audiencia: {
      ubicaciones: data.audiencia.ubicaciones.filter((item) => item.nombre.trim() || item.porcentaje.trim()).slice(0, 6),
      edades: data.audiencia.edades.filter((item) => item.rango.trim() || item.porcentaje.trim()).slice(0, 6),
      genero: data.audiencia.genero,
    },
    insightsAdicionales: (data.insightsAdicionales ?? []).filter((item) => item.trim()).slice(0, 4),
    sugerenciasProximoMes: (data.sugerenciasProximoMes ?? []).filter((item) => item.trim()).slice(0, 6),
  };
}

export function platformPills(plataforma: string): string[] {
  const normalized = plataforma.trim().toLowerCase();
  if (normalized.includes("&")) {
    return plataforma.split("&").map((item) => item.trim()).filter(Boolean);
  }

  if (normalized.includes("/")) {
    return plataforma.split("/").map((item) => item.trim()).filter(Boolean);
  }

  return [plataforma || "Plataforma"];
}

export function parsePercentage(value: string): number {
  const normalized = value.replace("%", "").replace(",", ".").trim();
  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }

  return Math.min(parsed, 100);
}
