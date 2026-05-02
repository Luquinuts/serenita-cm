import { ReportData } from "../types/report";

export const sampleReport: ReportData = {
  periodo: "abril",
  cuenta: "FADASD",
  plataforma: "Instagram",
  datosGenerales: {
    visualizaciones: "171.580",
    porcentajeSeguidores: "53%",
    porcentajeNoSeguidores: "46%",
    interacciones: "5,7 mil",
    nuevosSeguidores: "258",
    publicaciones: "11",
    cuentasAlcanzadas: "43.100",
    variacionCuentasAlcanzadasVsMesAnterior: "51,5% más que el mes anterior",
  },
  topPublicaciones: [
    {
      orden: 1,
      tipo: "Reel",
      titulo: "Reel de la concentración de básquet",
      metricas: [
        { label: "Visualizaciones", valor: "17,2 mil" },
        { label: "Likes", valor: "520" },
        { label: "Comentarios", valor: "23" },
        { label: "Repost", valor: "80" },
        { label: "Compartidos", valor: "123" },
      ],
    },
    {
      orden: 2,
      tipo: "Carrusel",
      titulo: "Carrusel de seleccionado de atletismo",
      metricas: [
        { label: "Visualizaciones", valor: "12,6 mil" },
        { label: "Likes", valor: "303" },
        { label: "Comentarios", valor: "6" },
        { label: "Repost", valor: "13" },
        { label: "Compartidos", valor: "11" },
      ],
    },
    {
      orden: 3,
      tipo: "Placa",
      titulo: "Placa genérica de ayuda al mundial",
      metricas: [
        { label: "Visualizaciones", valor: "3,7 mil" },
        { label: "Me gusta", valor: "237" },
        { label: "Comentarios", valor: "8" },
        { label: "Repost", valor: "14" },
        { label: "Compartidos", valor: "8" },
      ],
    },
  ],
  audiencia: {
    ubicaciones: [
      { nombre: "Buenos Aires", porcentaje: "6%" },
      { nombre: "Mar del Plata", porcentaje: "5%" },
      { nombre: "Córdoba", porcentaje: "5%" },
      { nombre: "Rosario", porcentaje: "1%" },
    ],
    edades: [
      { rango: "25 a 34", porcentaje: "23%" },
      { rango: "35 a 44", porcentaje: "21%" },
      { rango: "45 a 54", porcentaje: "20%" },
      { rango: "18 a 24", porcentaje: "13%" },
    ],
    genero: {
      mujeres: "54,1%",
      hombres: "45,9%",
    },
  },
  insightsAdicionales: [
    "Reel de básquet funcionó excelente, combinar disciplinas con institucional",
    "Las publicaciones con foco emocional e institucional generan mejor respuesta",
    "El contenido deportivo con contexto humano mejora el engagement",
    "La audiencia femenina lidera levemente el consumo de contenido",
  ],
  sugerenciasProximoMes: [
    "Aumentar la frecuencia de reels con foco humano e institucional para sostener el alcance del perfil.",
    "Planificar más carruseles con storytelling breve y una primera placa mucho más fuerte.",
    "Repetir temas deportivos que mezclen rendimiento con identidad institucional de la cuenta.",
    "Sumar llamados a la acción más claros para incentivar guardados, compartidos y consultas.",
  ],
};
