import { Navigate, Outlet } from "react-router-dom";
import serenitaLogo from "../assets/serenita-logo.svg";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { session, isLoading } = useAuth();

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

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ session }} />;
}
