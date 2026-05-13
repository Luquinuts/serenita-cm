import { FormEvent, useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ?? `${window.location.protocol}//${window.location.hostname}:8000`;

type AiStatus = {
  configured: boolean;
  model: string;
};

type AiResponse = {
  answer: string;
  model: string;
};

type AiAssistantSectionProps = {
  accessToken: string;
};

export function AiAssistantSection({ accessToken }: AiAssistantSectionProps) {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void loadAiStatus();
  }, [accessToken]);

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

  async function loadAiStatus() {
    try {
      const response = await apiFetch("/api/ai/status");
      if (!response.ok) {
        throw new Error("No se pudo verificar la conexion con OpenAI.");
      }

      setAiStatus((await response.json()) as AiStatus);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo verificar la conexion con OpenAI.");
    }
  }

  async function askAi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) {
      return;
    }

    setIsLoading(true);
    setStatus("Consultando IA...");
    setAnswer("");

    try {
      const response = await apiFetch("/api/ai/query", {
        method: "POST",
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      if (!response.ok) {
        throw new Error("No se pudo completar la consulta.");
      }

      const data = (await response.json()) as AiResponse;
      setAnswer(data.answer);
      setStatus(`Respuesta generada con ${data.model}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo completar la consulta.");
    } finally {
      setIsLoading(false);
    }
  }

  const isConfigured = aiStatus?.configured ?? false;

  return (
    <section className="panel workspace-content-panel ai-panel">
      <div className="section-heading">
        <div>
          <h1 className="workspace-title">IA</h1>
          <p className="workspace-copy">Realiza consultas y prepara ideas para reportes, contenido y analisis.</p>
        </div>
        <span className={`connection-status ${isConfigured ? "activa" : "error"}`}>
          {isConfigured ? "activa" : "sin configurar"}
        </span>
      </div>

      {status ? <p className="status-line">{status}</p> : null}

      <form className="ai-query-form" onSubmit={askAi}>
        <label className="field">
          <span>Consulta</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ej: Dame 5 ideas de contenido para una marca de indumentaria durante mayo."
            rows={7}
            disabled={!isConfigured}
            required
          />
        </label>
        <button type="submit" className="button button-primary" disabled={!isConfigured || isLoading || !prompt.trim()}>
          {isLoading ? "Pensando..." : "Consultar"}
        </button>
      </form>

      {answer ? (
        <article className="ai-answer">
          <strong>Respuesta</strong>
          <p>{answer}</p>
        </article>
      ) : null}
    </section>
  );
}
