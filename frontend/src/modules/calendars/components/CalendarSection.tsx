import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCalendars } from "../hooks/useCalendars";
import {
  contentTypeColors,
  contentTypeLabels,
  getMonthGrid,
  getWeekGrid,
  groupItemsByDate,
  monthNames,
  priorityLabels,
  toDateKey,
} from "../lib/calendarUtils";
import {
  CalendarFilters,
  CalendarItemDraft,
  CalendarViewMode,
  ContentCalendar,
  ContentCalendarItem,
  ContentItemStatus,
  ContentType,
} from "../types";

type CalendarSectionProps = {
  accessToken: string;
};

const today = new Date();
const emptyDraft = (date: string): CalendarItemDraft => ({
  scheduled_date: date,
  content_type: "reel",
  title: "",
  description: "",
  objective: "",
  status: "pendiente",
  priority: "medium",
  observations: "",
  color_tag: "",
  position_in_day: 0,
});

function CalendarCard({
  calendar,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  calendar: ContentCalendar;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <article className={`calendar-card${isActive ? " active" : ""}`}>
      <button type="button" onClick={onSelect}>
        <strong>{calendar.name}</strong>
        <span>
          {monthNames[calendar.month - 1]} {calendar.year} · {calendar.status}
        </span>
      </button>
      <div className="calendar-card-actions">
        <button type="button" className="button button-ghost small" onClick={onDuplicate}>
          Duplicar
        </button>
        <button type="button" className="button button-ghost small" onClick={onDelete}>
          Eliminar
        </button>
      </div>
    </article>
  );
}

function ContentTypeBadge({ type }: { type: ContentType }) {
  return (
    <span className="content-type-badge" style={{ borderColor: contentTypeColors[type], color: contentTypeColors[type] }}>
      {contentTypeLabels[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: ContentItemStatus }) {
  return <span className={`calendar-status-badge ${status}`}>{status.replace("_", " ")}</span>;
}

function CalendarItemPill({
  item,
  onEdit,
}: {
  item: ContentCalendarItem;
  onEdit: () => void;
}) {
  return (
    <button type="button" className={`calendar-item-pill priority-${item.priority}`} onClick={onEdit}>
      <span className="calendar-item-dot" style={{ background: item.color_tag ?? contentTypeColors[item.content_type] }} />
      <span>{item.title}</span>
    </button>
  );
}

function ContentItemModal({
  draft,
  editingItem,
  onChange,
  onClose,
  onSubmit,
  onDelete,
}: {
  draft: CalendarItemDraft;
  editingItem: ContentCalendarItem | null;
  onChange: (draft: CalendarItemDraft) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="content-item-modal" onSubmit={onSubmit}>
        <div className="section-heading">
          <div>
            <h2>{editingItem ? "Editar item" : "Nuevo item"}</h2>
            <p className="workspace-copy">{draft.scheduled_date}</p>
          </div>
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="field-grid field-grid-two">
          <label className="field">
            <span>Fecha</span>
            <input type="date" value={draft.scheduled_date} onChange={(event) => onChange({ ...draft, scheduled_date: event.target.value })} />
          </label>
          <label className="field">
            <span>Tipo</span>
            <select value={draft.content_type} onChange={(event) => onChange({ ...draft, content_type: event.target.value as ContentType })}>
              {Object.entries(contentTypeLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Titulo</span>
          <input value={draft.title} onChange={(event) => onChange({ ...draft, title: event.target.value })} required />
        </label>

        <label className="field">
          <span>Descripcion</span>
          <textarea value={draft.description} onChange={(event) => onChange({ ...draft, description: event.target.value })} rows={3} />
        </label>

        <div className="field-grid field-grid-two">
          <label className="field">
            <span>Objetivo</span>
            <input value={draft.objective} onChange={(event) => onChange({ ...draft, objective: event.target.value })} />
          </label>
          <label className="field">
            <span>Color</span>
            <input type="color" value={draft.color_tag || contentTypeColors[draft.content_type]} onChange={(event) => onChange({ ...draft, color_tag: event.target.value })} />
          </label>
          <label className="field">
            <span>Estado</span>
            <select value={draft.status} onChange={(event) => onChange({ ...draft, status: event.target.value as CalendarItemDraft["status"] })}>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="aprobado">Aprobado</option>
              <option value="publicado">Publicado</option>
            </select>
          </label>
          <label className="field">
            <span>Prioridad</span>
            <select value={draft.priority} onChange={(event) => onChange({ ...draft, priority: event.target.value as CalendarItemDraft["priority"] })}>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Observaciones</span>
          <textarea value={draft.observations} onChange={(event) => onChange({ ...draft, observations: event.target.value })} rows={3} />
        </label>

        <div className="modal-actions">
          {editingItem ? (
            <button type="button" className="button button-ghost" onClick={onDelete}>
              Eliminar item
            </button>
          ) : null}
          <button type="submit" className="button button-primary" disabled={!draft.title.trim()}>
            {editingItem ? "Guardar cambios" : "Crear item"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CalendarCreateModal({
  name,
  onChange,
  onClose,
  onSubmit,
}: {
  name: string;
  onChange: (name: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="content-item-modal calendar-create-modal" onSubmit={onSubmit}>
        <div className="section-heading">
          <div>
            <h2>Nuevo calendario</h2>
            <p className="workspace-copy">El nombre se usara para encontrarlo rapidamente en el buscador.</p>
          </div>
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <label className="field">
          <span>Nombre del calendario</span>
          <input
            value={name}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Ej: Mayo 2026 - Cliente A"
            autoFocus
            required
          />
        </label>

        <div className="modal-actions">
          <button type="submit" className="button button-primary" disabled={!name.trim()}>
            Crear calendario
          </button>
        </div>
      </form>
    </div>
  );
}

export function CalendarSection({ accessToken }: CalendarSectionProps) {
  const [filters, setFilters] = useState<CalendarFilters>({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    status: "all",
    query: "",
  });
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [weekAnchor, setWeekAnchor] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState<CalendarItemDraft | null>(null);
  const [editingItem, setEditingItem] = useState<ContentCalendarItem | null>(null);
  const [isCreateCalendarOpen, setIsCreateCalendarOpen] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState("");

  const {
    calendars,
    selectedCalendar,
    items,
    status,
    isLoading,
    loadCalendarDetail,
    createCalendar,
    duplicateCalendar,
    deleteCalendar,
    createItem,
    updateItem,
    deleteItem,
  } = useCalendars(accessToken, filters);

  const itemsByDate = useMemo(() => groupItemsByDate(items), [items]);
  const visibleDays = viewMode === "month" ? getMonthGrid(filters.year, filters.month) : getWeekGrid(weekAnchor);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFilters((current) => ({ ...current, query: searchQuery.trim() }));
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  function moveWeek(direction: -1 | 1) {
    setWeekAnchor((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + direction * 7);
      return next;
    });
  }

  function openNewItem(dateKey: string) {
    setEditingItem(null);
    setDraft(emptyDraft(dateKey));
  }

  function openEditItem(item: ContentCalendarItem) {
    setEditingItem(item);
    setDraft({
      scheduled_date: item.scheduled_date,
      content_type: item.content_type,
      title: item.title,
      description: item.description ?? "",
      objective: item.objective ?? "",
      status: item.status,
      priority: item.priority,
      observations: item.observations ?? "",
      color_tag: item.color_tag ?? "",
      position_in_day: item.position_in_day,
    });
  }

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;

    if (editingItem) {
      await updateItem(editingItem.id, draft);
    } else {
      await createItem(draft);
    }
    setDraft(null);
    setEditingItem(null);
  }

  async function removeEditingItem() {
    if (!editingItem) return;
    await deleteItem(editingItem.id);
    setDraft(null);
    setEditingItem(null);
  }

  async function submitCalendar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = newCalendarName.trim();
    if (!normalizedName) return;

    const created = await createCalendar(normalizedName);
    if (created) {
      setNewCalendarName("");
      setIsCreateCalendarOpen(false);
    }
  }

  return (
    <section className="panel workspace-content-panel calendars-page">
      <div className="section-heading">
        <div>
          <h1 className="workspace-title">Calendario</h1>
          <p className="workspace-copy">Planifica contenido mensual por cuenta, estado, tipo y prioridad.</p>
        </div>
        <button type="button" className="button button-primary" onClick={() => setIsCreateCalendarOpen(true)}>
          Nuevo calendario
        </button>
      </div>

      {status ? <p className="status-line">{status}</p> : null}

      <div className="calendar-workspace">
        <aside className="calendar-sidebar">
          <div className="calendar-filters">
            <label className="field">
              <span>Buscar</span>
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cliente, campana..." />
            </label>
            <div className="field-grid field-grid-two">
              <label className="field">
                <span>Mes</span>
                <select value={filters.month} onChange={(event) => setFilters({ ...filters, month: Number(event.target.value) })}>
                  {monthNames.map((name, index) => (
                    <option value={index + 1} key={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Anio</span>
                <input type="number" value={filters.year} onChange={(event) => setFilters({ ...filters, year: Number(event.target.value) })} />
              </label>
            </div>
            <label className="field">
              <span>Estado</span>
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as CalendarFilters["status"] })}>
                <option value="all">Todos</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <div className="calendar-list">
            {calendars.map((calendar) => (
              <CalendarCard
                key={calendar.id}
                calendar={calendar}
                isActive={selectedCalendar?.id === calendar.id}
                onSelect={() => loadCalendarDetail(calendar.id)}
                onDuplicate={() => duplicateCalendar(calendar.id)}
                onDelete={() => deleteCalendar(calendar.id)}
              />
            ))}
            {!isLoading && calendars.length === 0 ? <p className="history-empty">Todavia no hay calendarios para este periodo.</p> : null}
          </div>
        </aside>

        <main className={`calendar-main${selectedCalendar ? "" : " disabled"}`}>
          {!selectedCalendar ? (
            <div className="calendar-disabled-overlay">
              <strong>Selecciona o crea un calendario</strong>
              <span>La grilla queda bloqueada hasta que haya un calendario activo para editar.</span>
            </div>
          ) : null}

          <div className="calendar-toolbar">
            <div>
              <strong>{selectedCalendar?.name ?? "Sin calendario seleccionado"}</strong>
              <span>
                {monthNames[filters.month - 1]} {filters.year}
              </span>
            </div>
            <div className="segmented-control">
              <button type="button" className={viewMode === "month" ? "active" : ""} onClick={() => setViewMode("month")}>
                Mes
              </button>
              <button type="button" className={viewMode === "week" ? "active" : ""} onClick={() => setViewMode("week")}>
                Semana
              </button>
            </div>
            {viewMode === "week" ? (
              <div className="calendar-week-actions">
                <button type="button" className="button button-ghost small" onClick={() => moveWeek(-1)}>
                  Anterior
                </button>
                <button type="button" className="button button-ghost small" onClick={() => setWeekAnchor(today)}>
                  Hoy
                </button>
                <button type="button" className="button button-ghost small" onClick={() => moveWeek(1)}>
                  Siguiente
                </button>
              </div>
            ) : null}
          </div>

          <div className={`calendar-grid ${viewMode}`}>
            {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((day) => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            ))}
            {visibleDays.map((date) => {
              const dateKey = toDateKey(date);
              const dayItems = itemsByDate[dateKey] ?? [];
              const isCurrentMonth = date.getMonth() + 1 === filters.month;
              return (
                <article className={`calendar-day${isCurrentMonth ? "" : " muted"}`} key={dateKey}>
                  <button type="button" className="calendar-day-header" onClick={() => openNewItem(dateKey)} disabled={!selectedCalendar}>
                    <span>{date.getDate()}</span>
                    <strong>+</strong>
                  </button>
                  <div className="calendar-day-items">
                    {dayItems.map((item) => (
                      <div className="calendar-item-stack" key={item.id}>
                        <CalendarItemPill item={item} onEdit={() => openEditItem(item)} />
                        <div className="calendar-item-meta">
                          <ContentTypeBadge type={item.content_type} />
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      </div>

      {draft ? (
        <ContentItemModal
          draft={draft}
          editingItem={editingItem}
          onChange={setDraft}
          onClose={() => {
            setDraft(null);
            setEditingItem(null);
          }}
          onSubmit={submitItem}
          onDelete={removeEditingItem}
        />
      ) : null}

      {isCreateCalendarOpen ? (
        <CalendarCreateModal
          name={newCalendarName}
          onChange={setNewCalendarName}
          onClose={() => {
            setIsCreateCalendarOpen(false);
            setNewCalendarName("");
          }}
          onSubmit={submitCalendar}
        />
      ) : null}
    </section>
  );
}
