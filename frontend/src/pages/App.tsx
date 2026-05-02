import { FormEvent, useEffect, useMemo, useState } from "react";
import { ReportGeneratorSection } from "../sections/ReportGeneratorSection";

const ACCESS_CODE = "071123";
const AUTH_STORAGE_KEY = "serenita-cm:authenticated";
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
  const [accessCode, setAccessCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleId>("reports");
  const [currentView, setCurrentView] = useState<AppView>("login");

  useEffect(() => {
    const authenticated = sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
    const storedView = sessionStorage.getItem(VIEW_STORAGE_KEY) as AppView | null;

    setIsAuthenticated(authenticated);
    setCurrentView(authenticated && storedView ? storedView : authenticated ? "menu" : "login");
  }, []);

  const activeModuleData = useMemo(
    () => modules.find((module) => module.id === activeModule) ?? modules[0],
    [activeModule],
  );

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (accessCode !== ACCESS_CODE) {
      setLoginError("Codigo incorrecto. Revisa el acceso e intenta nuevamente.");
      return;
    }

    sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
    sessionStorage.setItem(VIEW_STORAGE_KEY, "menu");
    setLoginError("");
    setAccessCode("");
    setIsAuthenticated(true);
    setCurrentView("menu");
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(VIEW_STORAGE_KEY);
    setIsAuthenticated(false);
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

  if (!isAuthenticated || currentView === "login") {
    return (
      <div className="login-shell">
        <section className="login-card">
          <div className="login-hero">
            <p className="brand-kicker">Serenita CM Suite</p>
            <h1>Acceso centralizado para el equipo</h1>
            <p>
              Esta app ahora funciona como base para varios modulos. Ingresa el codigo de acceso para entrar al panel y
              usar el generador de reportes.
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label className="field">
              <span>Codigo de acceso</span>
              <input
                type="password"
                inputMode="numeric"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="Ingresa el codigo"
              />
            </label>

            {loginError ? <p className="login-error">{loginError}</p> : null}

            <button type="submit" className="button button-primary login-button">
              Ingresar
            </button>
          </form>

          <div className="login-note">
            <strong>Acceso actual:</strong> modulo privado para operaciones internas y futuras funcionalidades.
          </div>
        </section>
      </div>
    );
  }

  if (currentView === "menu") {
    return (
      <div className="menu-shell">
        <header className="menu-hero panel">
          <div>
            <p className="brand-kicker">Serenita CM Suite</p>
            <h1 className="workspace-title">Menu principal</h1>
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
        <div>
          <p className="brand-kicker">{activeModuleData.eyebrow}</p>
          <h2>{activeModuleData.title}</h2>
          <p>{activeModuleData.description}</p>
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

      <ReportGeneratorSection />
    </div>
  );
}

export default App;
