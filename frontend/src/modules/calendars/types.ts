export type CalendarStatus = "draft" | "active" | "archived";
export type ContentType = "reel" | "carousel" | "story" | "content_creation";
export type ContentItemStatus = "pendiente" | "en_progreso" | "aprobado" | "publicado";
export type ContentItemPriority = "low" | "medium" | "high" | "urgent";
export type CalendarViewMode = "month" | "week";

export type ContentCalendar = {
  id: string;
  organization_id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  month: number;
  year: number;
  status: CalendarStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ContentCalendarItem = {
  id: string;
  calendar_id: string;
  scheduled_date: string;
  content_type: ContentType;
  title: string;
  description: string | null;
  objective: string | null;
  status: ContentItemStatus;
  priority: ContentItemPriority;
  observations: string | null;
  color_tag: string | null;
  position_in_day: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CalendarFilters = {
  month: number;
  year: number;
  status: CalendarStatus | "all";
  query: string;
};

export type CalendarItemDraft = {
  scheduled_date: string;
  content_type: ContentType;
  title: string;
  description: string;
  objective: string;
  status: ContentItemStatus;
  priority: ContentItemPriority;
  observations: string;
  color_tag: string;
  position_in_day: number;
};
