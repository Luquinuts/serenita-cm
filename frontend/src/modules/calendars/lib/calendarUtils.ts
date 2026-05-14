import { ContentCalendarItem, ContentItemPriority, ContentType } from "../types";

export const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const contentTypeLabels: Record<ContentType, string> = {
  reel: "Reel",
  carousel: "Carrusel",
  story: "Historia",
  content_creation: "Creacion de contenido",
};

export const priorityLabels: Record<ContentItemPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export const contentTypeColors: Record<ContentType, string> = {
  reel: "#2dd4bf",
  carousel: "#60a5fa",
  story: "#facc15",
  content_creation: "#c084fc",
};

export const calendarColorOptions = ["#2dd4bf", "#60a5fa", "#facc15", "#c084fc", "#fb7185", "#a3e635"];

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month - 1, 1);
  const gridStart = new Date(firstDay);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  gridStart.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

export function getWeekGrid(anchor: Date): Date[] {
  const start = new Date(anchor);
  const mondayOffset = (anchor.getDay() + 6) % 7;
  start.setDate(anchor.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function groupItemsByDate(items: ContentCalendarItem[]): Record<string, ContentCalendarItem[]> {
  return items.reduce<Record<string, ContentCalendarItem[]>>((groups, item) => {
    groups[item.scheduled_date] = [...(groups[item.scheduled_date] ?? []), item].sort((a, b) => {
      if (a.priority !== b.priority) {
        const weight = { urgent: 0, high: 1, medium: 2, low: 3 };
        return weight[a.priority] - weight[b.priority];
      }
      return a.position_in_day - b.position_in_day;
    });
    return groups;
  }, {});
}
