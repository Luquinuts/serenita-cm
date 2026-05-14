import { useCallback, useEffect, useState } from "react";
import {
  CalendarFilters,
  CalendarItemDraft,
  ContentCalendar,
  ContentCalendarItem,
} from "../types";

const API_URL =
  import.meta.env.VITE_API_URL ?? `${window.location.protocol}//${window.location.hostname}:8000`;

type CalendarDetail = {
  calendar: ContentCalendar;
  items: ContentCalendarItem[];
};

export function useCalendars(accessToken: string, filters: CalendarFilters) {
  const [calendars, setCalendars] = useState<ContentCalendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<ContentCalendar | null>(null);
  const [items, setItems] = useState<ContentCalendarItem[]>([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const apiFetch = useCallback(
    (path: string, options: RequestInit = {}) =>
      fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...(options.headers ?? {}),
        },
      }),
    [accessToken],
  );

  const loadCalendarDetail = useCallback(
    async (calendarId: string) => {
      setIsLoading(true);
      setStatus("");

      try {
        const response = await apiFetch(`/api/calendars/${calendarId}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar el calendario.");
        }

        const data = (await response.json()) as CalendarDetail;
        setSelectedCalendar(data.calendar);
        setItems(data.items);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "No se pudo cargar el calendario.");
      } finally {
        setIsLoading(false);
      }
    },
    [apiFetch],
  );

  const loadCalendars = useCallback(async () => {
    setIsLoading(true);
    setStatus("");

    const params = new URLSearchParams({
      month: String(filters.month),
      year: String(filters.year),
    });
    if (filters.status !== "all") {
      params.set("status", filters.status);
    }
    if (filters.query.trim()) {
      params.set("q", filters.query.trim());
    }

    try {
      const response = await apiFetch(`/api/calendars?${params.toString()}`);
      if (!response.ok) {
        throw new Error("No se pudieron cargar los calendarios.");
      }

      const data = (await response.json()) as { calendars: ContentCalendar[] };
      setCalendars(data.calendars);
      const currentCalendarStillVisible = data.calendars.some((calendar) => calendar.id === selectedCalendar?.id);
      if (!currentCalendarStillVisible && data.calendars[0]) {
        await loadCalendarDetail(data.calendars[0].id);
      } else if (!currentCalendarStillVisible) {
        setSelectedCalendar(null);
        setItems([]);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudieron cargar los calendarios.");
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, filters.month, filters.query, filters.status, filters.year, selectedCalendar]);

  useEffect(() => {
    void loadCalendars();
  }, [loadCalendars]);

  async function createCalendar(name: string) {
    const response = await apiFetch("/api/calendars", {
      method: "POST",
      body: JSON.stringify({
        name,
        month: filters.month,
        year: filters.year,
        status: "draft",
      }),
    });
    if (!response.ok) {
      setStatus("No se pudo crear el calendario.");
      return;
    }
    const calendar = (await response.json()) as ContentCalendar;
    setCalendars((current) => [calendar, ...current]);
    await loadCalendarDetail(calendar.id);
  }

  async function duplicateCalendar(calendarId: string) {
    const response = await apiFetch(`/api/calendars/${calendarId}/duplicate`, { method: "POST" });
    if (!response.ok) {
      setStatus("No se pudo duplicar el calendario.");
      return;
    }
    const calendar = (await response.json()) as ContentCalendar;
    setCalendars((current) => [calendar, ...current]);
    await loadCalendarDetail(calendar.id);
  }

  async function deleteCalendar(calendarId: string) {
    const response = await apiFetch(`/api/calendars/${calendarId}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("No se pudo eliminar el calendario.");
      return;
    }
    setCalendars((current) => current.filter((calendar) => calendar.id !== calendarId));
    setSelectedCalendar(null);
    setItems([]);
  }

  async function createItem(draft: CalendarItemDraft) {
    if (!selectedCalendar) return;
    const response = await apiFetch(`/api/calendars/${selectedCalendar.id}/items`, {
      method: "POST",
      body: JSON.stringify({
        ...draft,
        description: draft.description || null,
        objective: draft.objective || null,
        observations: draft.observations || null,
        color_tag: draft.color_tag || null,
      }),
    });
    if (!response.ok) {
      setStatus("No se pudo crear el item.");
      return;
    }
    const item = (await response.json()) as ContentCalendarItem;
    setItems((current) => [...current, item]);
    setStatus("Item creado.");
  }

  async function updateItem(itemId: string, payload: Partial<CalendarItemDraft>) {
    const response = await apiFetch(`/api/calendars/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setStatus("No se pudo actualizar el item.");
      return;
    }
    const item = (await response.json()) as ContentCalendarItem;
    setItems((current) => current.map((currentItem) => (currentItem.id === item.id ? item : currentItem)));
  }

  async function deleteItem(itemId: string) {
    const response = await apiFetch(`/api/calendars/items/${itemId}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("No se pudo eliminar el item.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  return {
    calendars,
    selectedCalendar,
    items,
    status,
    isLoading,
    loadCalendars,
    loadCalendarDetail,
    createCalendar,
    duplicateCalendar,
    deleteCalendar,
    createItem,
    updateItem,
    deleteItem,
    setStatus,
  };
}
