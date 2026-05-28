import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import serenitaLogo from "../assets/serenita-logo.svg";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const VIEW_STORAGE_KEY = "serenita-cm:active-view";

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!isLoading && session) {
      navigate("/app/reports", { replace: true });
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
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

  if (session) {
    return null;
  }

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
    navigate("/app/reports", { replace: true });
  }

  return (
    <div className="login-shell">
      <section className="login-card">
        <div className="login-hero">
          <div className="brand-lockup">
            <img src={serenitaLogo} alt="Serenita CM" className="brand-logo brand-logo-large" />
            <div>
              <h1 className="brand-kicker">Serenita CM</h1>
            </div>
          </div>
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
          <Link
            to="/politicas"
            className="button button-ghost"
            style={{ padding: "0", margin: "0 8px" }}
          >
            Política de Privacidad
          </Link>
        </div>
      </section>
    </div>
  );
}
