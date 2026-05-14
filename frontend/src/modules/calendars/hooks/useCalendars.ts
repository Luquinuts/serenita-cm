import { useCallback, useEffect, useRef, useState } from "react";
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
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const selectedCalendarRef = useRef<ContentCalendar | null>(null);
  const detailCacheRef = useRef<Map<string, CalendarDetail>>(new Map());
  const listRequestIdRef = useRef(0);

  function selectCalendarDetail(detail: CalendarDetail) {
    selectedCalendarRef.current = detail.calendar;
    setSelectedCalendar(detail.calendar);
    setItems(detail.items);
    detailCacheRef.current.set(detail.calendar.id, detail);
  }

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
    async (calendarId: string, options: { force?: boolean; silent?: boolean } = {}) => {
      const cachedDetail = detailCacheRef.current.get(calendarId);
      if (cachedDetail && !options.force) {
        selectCalendarDetail(cachedDetail);
        return;
      }

      if (!options.silent) {
        setIsDetailLoading(true);
      }
      setStatus("");

      try {
        const response = await apiFetch(`/api/calendars/${calendarId}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar el calendario.");
        }

        const data = (await response.json()) as CalendarDetail;
        selectCalendarDetail(data);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "No se pudo cargar el calendario.");
      } finally {
        if (!options.silent) {
          setIsDetailLoading(false);
        }
      }
    },
    [apiFetch],
  );

  const loadCalendars = useCallback(async () => {
    const requestId = listRequestIdRef.current + 1;
    listRequestIdRef.current = requestId;
    setIsListLoading(true);
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
      if (requestId !== listRequestIdRef.current) {
        return;
      }

      setCalendars(data.calendars);
      const currentCalendar = selectedCalendarRef.current;
      const currentCalendarStillVisible = data.calendars.some((calendar) => calendar.id === currentCalendar?.id);
      if (!currentCalendarStillVisible && data.calendars[0]) {
        await loadCalendarDetail(data.calendars[0].id);
      } else if (!currentCalendarStillVisible) {
        selectedCalendarRef.current = null;
        setSelectedCalendar(null);
        setItems([]);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudieron cargar los calendarios.");
    } finally {
      if (requestId === listRequestIdRef.current) {
        setIsListLoading(false);
      }
    }
  }, [apiFetch, filters.month, filters.query, filters.status, filters.year, loadCalendarDetail]);

  useEffect(() => {
    void loadCalendars();
  }, [loadCalendars]);

  async function createCalendar(name: string): Promise<boolean> {
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
      return false;
    }
    const calendar = (await response.json()) as ContentCalendar;
    const detail = { calendar, items: [] };
    selectCalendarDetail(detail);
    setCalendars((current) => [calendar, ...current]);
    setStatus("Calendario creado.");
    return true;
  }

  async function duplicateCalendar(calendarId: string) {
    const response = await apiFetch(`/api/calendars/${calendarId}/duplicate`, { method: "POST" });
    if (!response.ok) {
      setStatus("No se pudo duplicar el calendario.");
      return;
    }
    const calendar = (await response.json()) as ContentCalendar;
    setCalendars((current) => [calendar, ...current]);
    selectCalendarDetail({ calendar, items: [] });
    void loadCalendarDetail(calendar.id, { force: true, silent: true });
    setStatus("Calendario duplicado.");
  }

  async function deleteCalendar(calendarId: string) {
    const response = await apiFetch(`/api/calendars/${calendarId}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("No se pudo eliminar el calendario.");
      return;
    }
    setCalendars((current) => current.filter((calendar) => calendar.id !== calendarId));
    detailCacheRef.current.delete(calendarId);
    if (selectedCalendarRef.current?.id === calendarId) {
      selectedCalendarRef.current = null;
      setSelectedCalendar(null);
      setItems([]);
    }
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
    setItems((current) => {
      const nextItems = [...current, item];
      if (selectedCalendarRef.current) {
        detailCacheRef.current.set(selectedCalendarRef.current.id, {
          calendar: selectedCalendarRef.current,
          items: nextItems,
        });
      }
      return nextItems;
    });
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
    setItems((current) => {
      const nextItems = current.map((currentItem) => (currentItem.id === item.id ? item : currentItem));
      if (selectedCalendarRef.current) {
        detailCacheRef.current.set(selectedCalendarRef.current.id, {
          calendar: selectedCalendarRef.current,
          items: nextItems,
        });
      }
      return nextItems;
    });
  }

  async function deleteItem(itemId: string) {
    const response = await apiFetch(`/api/calendars/items/${itemId}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("No se pudo eliminar el item.");
      return;
    }
    setItems((current) => {
      const nextItems = current.filter((item) => item.id !== itemId);
      if (selectedCalendarRef.current) {
        detailCacheRef.current.set(selectedCalendarRef.current.id, {
          calendar: selectedCalendarRef.current,
          items: nextItems,
        });
      }
      return nextItems;
    });
  }

  return {
    calendars,
    selectedCalendar,
    items,
    status,
    isLoading: isListLoading || isDetailLoading,
    isListLoading,
    isDetailLoading,
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
