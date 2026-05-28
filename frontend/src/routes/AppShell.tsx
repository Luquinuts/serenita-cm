import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { type Session } from "@supabase/supabase-js";
import { AiAssistantSection } from "../sections/AiAssistantSection";
import { CalendarSection } from "../modules/calendars/components/CalendarSection";
import { ConnectionsSection } from "../sections/ConnectionsSection";
import { ReportGeneratorSection } from "../sections/ReportGeneratorSection";
import { ReportHistorySection } from "../sections/ReportHistorySection";
import serenitaLogo from "../assets/serenita-logo.svg";
import { supabase } from "../lib/supabase";

const VIEW_STORAGE_KEY = "serenita-cm:active-view";
const THEME_STORAGE_KEY = "serenita-cm:theme";
const SIDEBAR_STORAGE_KEY = "serenita-cm:sidebar-collapsed";

const sections = [
  { id: "reports", navTitle: "Generador", icon: "report" },
  { id: "history", navTitle: "Historial", icon: "history" },
  { id: "calendar", navTitle: "Calendario", icon: "calendar" },
  { id: "connections", navTitle: "Conexion", icon: "connection" },
  { id: "ai", navTitle: "IA", icon: "ai" },
  { id: "settings", navTitle: "Ajustes", icon: "settings" },
] as const;

type AppSection = (typeof sections)[number]["id"];
type NavIconName = (typeof sections)[number]["icon"];
type ThemeMode = "dark" | "light";

function NavIcon({ name }: { name: NavIconName }) {
  if (name === "history") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5 6.8 15M17.2 9l2.6-1.5" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="3" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }

  if (name === "connection") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="4" />
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="16.5" cy="7.5" r="0.7" />
      </svg>
    );
  }

  if (name === "ai") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
        <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h4M10 13h5M10 17h5" />
    </svg>
  );
}

export default function AppShell() {
  const { session } = useOutletContext<{ session: Session }>();
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const resolvedSection: AppSection = sections.some((s) => s.id === section)
    ? (section as AppSection)
    : "reports";

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) ?? "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    sessionStorage.setItem(VIEW_STORAGE_KEY, resolvedSection);
  }, [resolvedSection]);

  async function handleLogout() {
    await supabase.auth.signOut();
    sessionStorage.removeItem(VIEW_STORAGE_KEY);
    navigate("/login", { replace: true });
  }

  function openSection(sectionId: AppSection) {
    navigate(`/app/${sectionId}`);
  }

  return (
    <div className={`app-shell${isSidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="app-sidebar panel" aria-label="Navegacion principal">
        <div className="sidebar-main">
          <div className="sidebar-topbar">
            <button
              type="button"
              className="brand-lockup sidebar-brand sidebar-brand-button"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              aria-label={isSidebarCollapsed ? "Desplegar sidebar" : "Contraer sidebar"}
              title={isSidebarCollapsed ? "Desplegar sidebar" : "Contraer sidebar"}
            >
              <img src={serenitaLogo} alt="Serenita CM" className="brand-logo" />
              <div>
                <strong>serenita-cm</strong>
              </div>
            </button>
          </div>

          <nav className="sidebar-nav">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`sidebar-link nav-rail-item${resolvedSection === s.id ? " active" : ""}`}
                onClick={() => openSection(s.id)}
                aria-current={resolvedSection === s.id ? "page" : undefined}
              >
                <span className="nav-rail-indicator" aria-hidden="true">
                  <span className="nav-rail-icon">
                    <NavIcon name={s.icon} />
                  </span>
                </span>
                <strong>{s.navTitle}</strong>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <p>{session.user.email}</p>
          <button type="button" className="button button-ghost logout-button" onClick={handleLogout}>
            <span className="logout-full-label">Cerrar sesion</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        {resolvedSection === "reports" ? <ReportGeneratorSection userId={session.user.id} /> : null}
        {resolvedSection === "history" ? <ReportHistorySection userId={session.user.id} /> : null}
        {resolvedSection === "calendar" ? <CalendarSection accessToken={session.access_token} /> : null}
        {resolvedSection === "connections" ? <ConnectionsSection accessToken={session.access_token} /> : null}
        {resolvedSection === "ai" ? <AiAssistantSection accessToken={session.access_token} /> : null}
        {resolvedSection === "settings" ? (
          <section className="panel workspace-content-panel">
            <p className="brand-kicker">Preferencias</p>
            <h1 className="workspace-title">Ajustes</h1>
            <div className="settings-list">
              <article className="settings-row">
                <div>
                  <strong>Modo de apariencia</strong>
                  <span>Cambia entre modo oscuro y modo claro para toda la app.</span>
                </div>
                <div className="segmented-control" aria-label="Modo de apariencia">
                  <button
                    type="button"
                    className={themeMode === "dark" ? "active" : ""}
                    onClick={() => setThemeMode("dark")}
                  >
                    Oscuro
                  </button>
                  <button
                    type="button"
                    className={themeMode === "light" ? "active" : ""}
                    onClick={() => setThemeMode("light")}
                  >
                    Claro
                  </button>
                </div>
              </article>

              <article className="settings-row">
                <div>
                  <strong>Política de Privacidad</strong>
                  <span>Consulta nuestra política de privacidad y tus derechos de datos.</span>
                </div>
                <Link to="/politicas" className="button button-ghost">
                  Ver
                </Link>
              </article>

              <article className="settings-row">
                <div>
                  <strong>Solicitar eliminación de datos</strong>
                  <span>Solicita la eliminación completa de tus datos personales. Contáctanos por correo.</span>
                </div>
                <a
                  href="mailto:luquinuts@gmail.com?subject=Solicitud de Eliminación de Datos - Serenita CM&body=Estimado equipo de Serenita CM,%0A%0ASolicito la eliminación completa de mis datos personales de la plataforma.%0A%0aMi email registrado es: [TU EMAIL AQUI]%0A%0AGracias,%0A[TU NOMBRE]"
                  className="button button-secondary"
                >
                  Contactar
                </a>
              </article>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
