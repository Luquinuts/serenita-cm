import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ?? `${window.location.protocol}//${window.location.hostname}:8000`;

type SocialConnection = {
  id: string;
  nombre_conexion: string;
  plataforma: string;
  provider_username?: string | null;
  token_expiration?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type ConnectionsSectionProps = {
  accessToken: string;
};

function InstagramIcon() {
  return (
    <svg className="instagram-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="16.8" cy="7.2" r="0.8" />
    </svg>
  );
}

function connectionStatus(connection: SocialConnection): string {
  if (connection.status !== "active") {
    return connection.status;
  }

  if (!connection.token_expiration) {
    return "activa";
  }

  return new Date(connection.token_expiration) < new Date() ? "expirada" : "activa";
}

export function ConnectionsSection({ accessToken }: ConnectionsSectionProps) {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [connectionName, setConnectionName] = useState("");

  const pendingConnectionId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("connection_id");
  }, []);

  const oauthStatus = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("oauth");
  }, []);

  useEffect(() => {
    void loadConnections();
  }, [accessToken]);

  useEffect(() => {
    if (oauthStatus === "success") {
      setStatus("Conexion creada. Asignale un nombre para identificarla mejor.");
    }

    if (oauthStatus === "error") {
      setStatus("No se pudo completar la conexion con Meta.");
    }
  }, [oauthStatus]);

  async function apiFetch(path: string, options: RequestInit = {}) {
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers ?? {}),
      },
    });
  }

  async function loadConnections() {
    setIsLoading(true);

    try {
      const response = await apiFetch("/api/connections");
      if (!response.ok) {
        throw new Error("No se pudieron cargar las conexiones.");
      }

      const data = (await response.json()) as { connections: SocialConnection[] };
      setConnections(data.connections);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudieron cargar las conexiones.");
    } finally {
      setIsLoading(false);
    }
  }

  async function startConnection() {
    setIsConnecting(true);
    setStatus("Abriendo autorizacion de Meta...");

    try {
      const response = await apiFetch("/api/connections/oauth/meta/start", { method: "POST" });
      if (!response.ok) {
        throw new Error("No se pudo iniciar el flujo OAuth.");
      }

      const data = (await response.json()) as { authorization_url: string };
      window.location.href = data.authorization_url;
    } catch (error) {
      setIsConnecting(false);
      setStatus(error instanceof Error ? error.message : "No se pudo iniciar el flujo OAuth.");
    }
  }

  async function renameConnection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pendingConnectionId || !connectionName.trim()) {
      return;
    }

    setIsRenaming(true);
    setStatus("Guardando nombre de conexion...");

    try {
      const response = await apiFetch(`/api/connections/${pendingConnectionId}`, {
        method: "PATCH",
        body: JSON.stringify({ nombre_conexion: connectionName.trim() }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el nombre de la conexion.");
      }

      setConnectionName("");
      setStatus("Nombre de conexion actualizado.");
      window.history.replaceState({}, "", `${window.location.pathname}?view=connections`);
      await loadConnections();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar el nombre de la conexion.");
    } finally {
      setIsRenaming(false);
    }
  }

  return (
    <section className="panel workspace-content-panel connections-panel">
      <div className="section-heading">
        <div>
          <p className="brand-kicker">Meta OAuth</p>
          <h1 className="workspace-title">Conexion</h1>
          <p className="workspace-copy">Administra las cuentas de Instagram conectadas a tu usuario.</p>
        </div>
        <button type="button" className="button button-primary" onClick={startConnection} disabled={isConnecting}>
          {isConnecting ? "Conectando..." : "Agregar conexion"}
        </button>
      </div>

      {pendingConnectionId ? (
        <form className="connection-name-form" onSubmit={renameConnection}>
          <label className="field">
            <span>Nombre de la conexion</span>
            <input
              value={connectionName}
              onChange={(event) => setConnectionName(event.target.value)}
              placeholder="Ej: Instagram Cliente A"
              required
            />
          </label>
          <button type="submit" className="button button-secondary" disabled={isRenaming || !connectionName.trim()}>
            {isRenaming ? "Guardando..." : "Guardar nombre"}
          </button>
        </form>
      ) : null}

      {status ? <p className="status-line">{status}</p> : null}

      <div className="connections-list">
        {connections.map((connection) => (
          <article className="connection-row" key={connection.id}>
            <div className="connection-platform-icon">
              <InstagramIcon />
            </div>
            <div>
              <strong>{connection.nombre_conexion}</strong>
              <span>{connection.provider_username || "Instagram"}</span>
            </div>
            <span className="connection-platform">Instagram</span>
            <span className={`connection-status ${connectionStatus(connection)}`}>
              {connectionStatus(connection)}
            </span>
          </article>
        ))}
      </div>

      {!isLoading && connections.length === 0 ? (
        <p className="history-empty">Todavia no hay cuentas de Instagram conectadas.</p>
      ) : null}

      {isLoading ? <p className="history-empty">Cargando conexiones...</p> : null}
    </section>
  );
}
