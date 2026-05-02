export type Plataforma = "Instagram" | "Facebook" | "TikTok" | "LinkedIn" | "X" | "YouTube" | "Otra";

export interface MetricaPublicacion {
  label: string;
  valor: string;
}

export interface TopPublicacion {
  orden: number;
  tipo: string;
  titulo: string;
  metricas: MetricaPublicacion[];
}

export interface UbicacionAudiencia {
  nombre: string;
  porcentaje: string;
}

export interface EdadAudiencia {
  rango: string;
  porcentaje: string;
}

export interface GeneroAudiencia {
  mujeres: string;
  hombres: string;
}

export interface DatosGenerales {
  visualizaciones: string;
  porcentajeSeguidores: string;
  porcentajeNoSeguidores: string;
  interacciones: string;
  nuevosSeguidores: string;
  publicaciones: string;
  cuentasAlcanzadas: string;
  variacionCuentasAlcanzadasVsMesAnterior: string;
}

export interface Audiencia {
  ubicaciones: UbicacionAudiencia[];
  edades: EdadAudiencia[];
  genero: GeneroAudiencia;
}

export interface ReportData {
  periodo: string;
  cuenta: string;
  plataforma: string;
  datosGenerales: DatosGenerales;
  topPublicaciones: TopPublicacion[];
  audiencia: Audiencia;
  insightsAdicionales: string[];
  sugerenciasProximoMes: string[];
}
