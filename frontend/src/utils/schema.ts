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

export const calendarSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(120, "Máximo 120 caracteres"),
  description: z.string().trim().max(800, "Máximo 800 caracteres").optional().default(""),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  status: z.enum(["draft", "active", "archived"]),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const calendarItemSchema = z.object({
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresá una fecha válida"),
  content_type: z.enum(["reel", "carousel", "story", "content_creation"]),
  title: z.string().trim().min(1, "Ingresá un título").max(160, "Máximo 160 caracteres"),
  description: z.string().trim().max(1200, "Máximo 1200 caracteres").optional().default(""),
  objective: z.string().trim().max(500, "Máximo 500 caracteres").optional().default(""),
  status: z.enum(["pendiente", "en_progreso", "aprobado", "publicado"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  observations: z.string().trim().max(1000, "Máximo 1000 caracteres").optional().default(""),
  color_tag: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Usá un color hexadecimal").optional().or(z.literal("")),
  position_in_day: z.number().int().min(0),
  metadata: z.record(z.unknown()).optional().default({}),
});

export type CalendarSchema = z.infer<typeof calendarSchema>;
export type CalendarItemSchema = z.infer<typeof calendarItemSchema>;
