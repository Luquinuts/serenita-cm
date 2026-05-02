import { FormEvent, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { ConnectionsSection } from "../sections/ConnectionsSection";
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
    icon: "report",
  },
  {
    id: "history",
    navTitle: "Historial",
    icon: "history",
  },
  {
    id: "connections",
    navTitle: "Conexion",
    icon: "connection",
  },
  {
    id: "settings",
    navTitle: "Ajustes",
    icon: "settings",
  },
] as const;

type AppSection = (typeof sections)[number]["id"];
type NavIconName = (typeof sections)[number]["icon"];
type ThemeMode = "dark" | "light";

function resolveStoredSection(value: string | null): AppSection {
  return sections.some((section) => section.id === value) ? (value as AppSection) : "reports";
}

function resolveInitialSection(): AppSection {
  const queryView = new URLSearchParams(window.location.search).get("view");
  return resolveStoredSection(queryView ?? sessionStorage.getItem(VIEW_STORAGE_KEY));
}

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

  if (name === "connection") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="4" />
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="16.5" cy="7.5" r="0.7" />
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
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const storedView = resolveInitialSection();
      setSession(data.session);
      setActiveSection(data.session && storedView ? storedView : "reports");
      setIsAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const storedView = resolveInitialSection();
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
              <p className="brand-kicker">Serenita CM</p>
              <h1>Preparando tu espacio</h1>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (showPrivacyPolicy) {
    return (
      <div className="login-shell">
        <section className="login-card" style={{ maxWidth: "800px" }}>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setShowPrivacyPolicy(false)}
            style={{ alignSelf: "flex-start", marginBottom: "24px" }}
          >
            ← Volver
          </button>

          <div className="brand-block">
            <p className="brand-kicker">Serenita CM Suite</p>
            <h1>Política de Privacidad</h1>
          </div>

          <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>1. Introducción</h2>
              <p>
                Serenita CM Suite ("nosotros", "nuestro" o "la Aplicación") se compromete a proteger tu privacidad. Esta 
                Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y salvaguardamos tu información 
                cuando utilizas nuestra aplicación web.
              </p>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>2. Información que Recopilamos</h2>
              <p>Recopilamos información que nos proporcionas directamente, incluyendo:</p>
              <ul style={{ marginLeft: "20px" }}>
                <li>Email y credenciales de autenticación</li>
                <li>Datos de reportes y análisis de redes sociales que creas</li>
                <li>Información de tu cuenta y preferencias</li>
                <li>Datos de uso y actividad en la plataforma</li>
              </ul>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>3. Uso de la Información</h2>
              <p>Utilizamos la información para:</p>
              <ul style={{ marginLeft: "20px" }}>
                <li>Proporcionar y mejorar nuestros servicios</li>
                <li>Procesar tus solicitudes y transacciones</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Proteger la seguridad y estabilidad de la plataforma</li>
              </ul>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>4. Almacenamiento de Datos</h2>
              <p>
                Almacenamos tus datos en servidores seguros. Tus datos se conservan mientras tu cuenta esté activa 
                o según sea necesario para proporcionar nuestros servicios.
              </p>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>5. Tus Derechos</h2>
              <p>Tienes derecho a:</p>
              <ul style={{ marginLeft: "20px" }}>
                <li>Acceder a tus datos personales</li>
                <li>Corregir información inexacta</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Revocar tu consentimiento</li>
              </ul>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>6. Solicitud de Eliminación de Datos</h2>
              <p>
                Si deseas solicitar la eliminación de todos tus datos personales, puedes hacerlo contactando a:
              </p>
              <p style={{ fontWeight: "600", marginTop: "12px" }}>
                📧 <a href="mailto:luquinuts@gmail.com" style={{ color: "var(--md-sys-color-primary)" }}>luquinuts@gmail.com</a>
              </p>
              <p style={{ marginTop: "12px", fontSize: "0.9rem" }}>
                Por favor incluye en tu solicitud: tu email registrado y una descripción clara de tu solicitud. 
                Procesaremos tu solicitud en un plazo de 30 días hábiles.
              </p>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>7. Cambios en esta Política</h2>
              <p>
                Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cambios significativos 
                publicando la nueva versión en esta página.
              </p>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>8. Contacto</h2>
              <p>
                Si tienes preguntas sobre esta Política de Privacidad, por favor contáctanos en:
              </p>
              <p style={{ fontWeight: "600", marginTop: "12px" }}>
                📧 <a href="mailto:luquinuts@gmail.com" style={{ color: "var(--md-sys-color-primary)" }}>luquinuts@gmail.com</a>
              </p>
            </section>
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
                <p className="brand-kicker">Serenita CM</p>
                <h1>Acceso centralizado para el equipo</h1>
              </div>
            </div>
            <p>Ingresa con tu email y contrasena para entrar al panel, generar reportes y consultar tu historial.</p>
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

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.85rem" }}>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setShowPrivacyPolicy(true)}
              style={{ padding: "0", margin: "0 8px" }}
            >
              Política de Privacidad
            </button>
          </div>
        </section>
      </div>
    );
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
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`sidebar-link nav-rail-item${activeSection === section.id ? " active" : ""}`}
                onClick={() => openSection(section.id)}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                <span className="nav-rail-indicator" aria-hidden="true">
                  <span className="nav-rail-icon">
                    <NavIcon name={section.icon} />
                  </span>
                </span>
                <strong>{section.navTitle}</strong>
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
        {activeSection === "reports" ? <ReportGeneratorSection userId={session.user.id} /> : null}
        {activeSection === "history" ? <ReportHistorySection userId={session.user.id} /> : null}
        {activeSection === "connections" ? <ConnectionsSection accessToken={session.access_token} /> : null}
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

              <article className="settings-row">
                <div>
                  <strong>Política de Privacidad</strong>
                  <span>Consulta nuestra política de privacidad y tus derechos de datos.</span>
                </div>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setShowPrivacyPolicy(true)}
                >
                  Ver
                </button>
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

export default App;
