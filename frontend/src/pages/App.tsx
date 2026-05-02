import { FormEvent, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { ReportGeneratorSection } from "../sections/ReportGeneratorSection";
import { ReportHistorySection } from "../sections/ReportHistorySection";
import serenitaLogo from "../assets/serenita-logo.svg";
import { supabase } from "../lib/supabase";

const VIEW_STORAGE_KEY = "serenita-cm:active-view";
const THEME_STORAGE_KEY = "serenita-cm:theme";
const SIDEBAR_STORAGE_KEY = "serenita-cm:sidebar-collapsed";

const sections = [
  {
    id: "reports",
    navTitle: "Generador",
    title: "Generador de reportes",
    description: "Carga balances, revisa la preview editorial y exporta el PDF final.",
    icon: "📄",
  },
  {
    id: "history",
    navTitle: "Historial",
    title: "Historial de reportes",
    description: "Consulta y redescarga los PDFs generados anteriormente.",
    icon: "⏱️",
  },
  {
    id: "settings",
    navTitle: "Ajustes",
    title: "Ajustes",
    description: "Personaliza la apariencia de la app.",
    icon: "⚙️",
  },
] as const;

type AppSection = (typeof sections)[number]["id"];
type ThemeMode = "dark" | "light";

function resolveStoredSection(value: string | null): AppSection {
  return sections.some((section) => section.id === value) ? (value as AppSection) : "reports";
}

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeSection, setActiveSection] = useState<AppSection>("reports");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) ?? "dark";
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const storedView = resolveStoredSection(sessionStorage.getItem(VIEW_STORAGE_KEY));
      setSession(data.session);
      setActiveSection(data.session && storedView ? storedView : "reports");
      setIsAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const storedView = resolveStoredSection(sessionStorage.getItem(VIEW_STORAGE_KEY));
      setSession(nextSession);
      setActiveSection(nextSession && storedView ? storedView : "reports");
      setIsAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const activeSectionData = useMemo(
    () => sections.find((section) => section.id === activeSection) ?? sections[0],
    [activeSection],
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoggingIn(false);

    if (error) {
      setLoginError("Email o contrasena incorrectos. Revisa tus datos e intenta nuevamente.");
      return;
    }

    sessionStorage.setItem(VIEW_STORAGE_KEY, "reports");
    setLoginError("");
    setPassword("");
    setActiveSection("reports");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    sessionStorage.removeItem(VIEW_STORAGE_KEY);
    setSession(null);
    setActiveSection("reports");
  }

  function openSection(sectionId: AppSection) {
    setActiveSection(sectionId);
    sessionStorage.setItem(VIEW_STORAGE_KEY, sectionId);
  }

  if (isAuthLoading) {
    return (
      <div className="login-shell">
        <section className="login-card">
          <div className="brand-lockup">
            <img src={serenitaLogo} alt="Serenita CM" className="brand-logo brand-logo-large" />
            <div>
              <p className="brand-kicker">Serenita CM Suite</p>
              <h1>Preparando tu espacio</h1>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="login-shell">
        <section className="login-card">
          <div className="login-hero">
            <div className="brand-lockup">
              <img src={serenitaLogo} alt="Serenita CM" className="brand-logo brand-logo-large" />
              <div>
                <p className="brand-kicker">Serenita CM Suite</p>
                <h1>Acceso centralizado para el equipo</h1>
              </div>
            </div>
            <p>
              Ingresa con tu email y contrasena para entrar al panel, generar reportes y consultar tu historial.
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span>Contrasena</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contrasena"
                autoComplete="current-password"
                required
              />
            </label>

            {loginError ? <p className="login-error">{loginError}</p> : null}

            <button type="submit" className="button button-primary login-button" disabled={isLoggingIn}>
              {isLoggingIn ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="login-note">
            <strong>Acceso privado:</strong> las cuentas se habilitan manualmente hasta activar el alta con pago mensual.
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`app-shell${isSidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="app-sidebar panel" aria-label="Navegacion principal">
        <div className="sidebar-main">
          <div className="brand-lockup sidebar-brand">
            <img src={serenitaLogo} alt="Serenita CM" className="brand-logo" />
            <div>
              <p className="brand-kicker">Serenita CM Suite</p>
              <strong>Panel</strong>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? "Desplegar sidebar" : "Contraer sidebar"}
            title={isSidebarCollapsed ? "Desplegar sidebar" : "Contraer sidebar"}
          >
            <span aria-hidden="true">{isSidebarCollapsed ? "Menu" : "<"}</span>
          </button>

          <nav className="sidebar-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`sidebar-link nav-rail-item${activeSection === section.id ? " active" : ""}`}
                onClick={() => openSection(section.id)}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                <span className="nav-rail-indicator" aria-hidden="true">
                  <span className="nav-rail-icon">{section.icon}</span>
                </span>
                <strong>{section.navTitle}</strong>
                <span>{section.description}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <p>{session.user.email}</p>
          <button type="button" className="button button-ghost logout-button" onClick={handleLogout}>
            <span className="logout-full-label">Cerrar sesion</span>
            <span className="logout-short-label">Salir</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="workspace-header panel report-page-header">
          <div>
            <p className="brand-kicker">Modulo activo</p>
            <h2>{activeSectionData.title}</h2>
            <p>{activeSectionData.description}</p>
          </div>
        </header>

        {activeSection === "reports" ? <ReportGeneratorSection userId={session.user.id} /> : null}
        {activeSection === "history" ? <ReportHistorySection userId={session.user.id} /> : null}
        {activeSection === "settings" ? (
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
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default App;
