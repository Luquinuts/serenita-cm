import { z } from "zod";

export const metricaSchema = z.object({
  label: z.string().trim().max(40, "Máximo 40 caracteres").optional().default(""),
  valor: z.string().trim().max(40, "Máximo 40 caracteres").optional().default(""),
});

export const publicacionSchema = z.object({
  orden: z.number().int().positive("Debe ser mayor a cero"),
  tipo: z.string().trim().max(30, "Máximo 30 caracteres").optional().default(""),
  titulo: z.string().trim().max(120, "Máximo 120 caracteres").optional().default(""),
  metricas: z.array(metricaSchema).max(8, "Máximo 8 métricas"),
});

export const itemPorcentajeSchema = z.object({
  nombre: z.string().trim().max(40, "Máximo 40 caracteres").optional().default(""),
  rango: z.string().trim().max(40, "Máximo 40 caracteres").optional().default(""),
  porcentaje: z.string().trim().max(20, "Máximo 20 caracteres").optional().default(""),
});

export const reportSchema = z.object({
  periodo: z.string().trim().min(1, "Ingresá el período"),
  cuenta: z.string().trim().min(1, "Ingresá la cuenta"),
  plataforma: z.string().trim().min(1, "Elegí una plataforma"),
  datosGenerales: z.object({
    visualizaciones: z.string().trim().optional().default(""),
    porcentajeSeguidores: z.string().trim().optional().default(""),
    porcentajeNoSeguidores: z.string().trim().optional().default(""),
    interacciones: z.string().trim().optional().default(""),
    nuevosSeguidores: z.string().trim().optional().default(""),
    publicaciones: z.string().trim().max(40, "Maximo 40 caracteres").optional().default(""),
    cuentasAlcanzadas: z.string().trim().optional().default(""),
    variacionCuentasAlcanzadasVsMesAnterior: z.string().trim().max(80, "Máximo 80 caracteres").optional().default(""),
  }),
  topPublicaciones: z.array(publicacionSchema).max(12, "Máximo 12 publicaciones"),
  audiencia: z.object({
    ubicaciones: z.array(itemPorcentajeSchema.pick({ nombre: true, porcentaje: true })).max(10, "Máximo 10 ubicaciones"),
    edades: z.array(itemPorcentajeSchema.pick({ rango: true, porcentaje: true })).max(10, "Máximo 10 rangos etarios"),
    genero: z.object({
      mujeres: z.string().trim().optional().default(""),
      hombres: z.string().trim().optional().default(""),
    }),
  }),
  insightsAdicionales: z.array(z.string().trim().max(180, "Máximo 180 caracteres")).max(8, "Máximo 8 insights").optional().default([]),
  sugerenciasProximoMes: z.array(z.string().trim().max(180, "Máximo 180 caracteres")).max(8, "Máximo 8 sugerencias").optional().default([]),
});

export type ReportSchema = z.infer<typeof reportSchema>;
