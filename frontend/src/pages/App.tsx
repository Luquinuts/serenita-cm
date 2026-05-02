import { FormEvent, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { ReportGeneratorSection } from "../sections/ReportGeneratorSection";
import serenitaLogo from "../assets/serenita-logo.svg";
import { supabase } from "../lib/supabase";

const VIEW_STORAGE_KEY = "serenita-cm:active-view";

const modules = [
  {
    id: "reports",
    eyebrow: "Activo",
    title: "Generador de reportes",
    description: "Carga balances, revisa la preview editorial y exporta el PDF final.",
    available: true,
  },
  {
    id: "calendar",
    eyebrow: "Proximo",
    title: "Calendario editorial",
    description: "Planificacion mensual de ideas, piezas y fechas clave.",
    available: false,
  },
  {
    id: "assets",
    eyebrow: "Proximo",
    title: "Biblioteca de activos",
    description: "Repositorio de creatividades, textos y referencias reutilizables.",
    available: false,
  },
  {
    id: "settings",
    eyebrow: "Proximo",
    title: "Configuracion",
    description: "Perfiles, accesos y parametros operativos de la cuenta.",
    available: false,
  },
] as const;

type ModuleId = (typeof modules)[number]["id"];
type AppView = "login" | "menu" | "reports";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleId>("reports");
  const [currentView, setCurrentView] = useState<AppView>("login");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const storedView = sessionStorage.getItem(VIEW_STORAGE_KEY) as AppView | null;
      setSession(data.session);
      setCurrentView(data.session && storedView ? storedView : data.session ? "menu" : "login");
      setIsAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const storedView = sessionStorage.getItem(VIEW_STORAGE_KEY) as AppView | null;
      setSession(nextSession);
      setCurrentView(nextSession && storedView ? storedView : nextSession ? "menu" : "login");
      setIsAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const activeModuleData = useMemo(
    () => modules.find((module) => module.id === activeModule) ?? modules[0],
    [activeModule],
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

    sessionStorage.setItem(VIEW_STORAGE_KEY, "menu");
    setLoginError("");
    setPassword("");
    setCurrentView("menu");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    sessionStorage.removeItem(VIEW_STORAGE_KEY);
    setSession(null);
    setActiveModule("reports");
    setCurrentView("login");
  }

  function openModule(moduleId: ModuleId) {
    setActiveModule(moduleId);
    const nextView: AppView = moduleId === "reports" ? "reports" : "menu";
    setCurrentView(nextView);
    sessionStorage.setItem(VIEW_STORAGE_KEY, nextView);
  }

  function goToMenu() {
    setCurrentView("menu");
    sessionStorage.setItem(VIEW_STORAGE_KEY, "menu");
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

  if (!session || currentView === "login") {
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

  if (currentView === "menu") {
    return (
      <div className="menu-shell">
        <header className="menu-hero panel">
          <div className="brand-lockup">
            <img src={serenitaLogo} alt="Serenita CM" className="brand-logo" />
            <div>
              <p className="brand-kicker">Serenita CM Suite</p>
              <h1 className="workspace-title">Menu principal</h1>
            </div>
          </div>
          <div className="menu-copy">
            <p className="workspace-copy">
              Desde aca elegis la funcionalidad que queres usar. El generador de reportes ya esta activo y el resto de
              modulos queda preparado para futuras etapas.
            </p>
          </div>
          <button type="button" className="button button-ghost logout-button menu-logout" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </header>

        <main className="menu-grid" aria-label="Modulos disponibles">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              className={`menu-module-card${module.id === activeModule ? " active" : ""}`}
              onClick={() => openModule(module.id)}
            >
              <span className="module-eyebrow">{module.eyebrow}</span>
              <strong>{module.title}</strong>
              <span>{module.description}</span>
            </button>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="report-page-shell">
      <header className="workspace-header panel report-page-header">
        <div className="brand-lockup">
          <img src={serenitaLogo} alt="Serenita CM" className="brand-logo" />
          <div>
            <p className="brand-kicker">{activeModuleData.eyebrow}</p>
            <h2>{activeModuleData.title}</h2>
            <p>{activeModuleData.description}</p>
          </div>
        </div>
        <div className="report-page-actions">
          <button type="button" className="button button-ghost" onClick={goToMenu}>
            Volver al menu
          </button>
          <button type="button" className="button button-ghost" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </header>

      <ReportGeneratorSection userId={session.user.id} />
    </div>
  );
}

export default App;
