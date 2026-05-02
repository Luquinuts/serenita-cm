import { useNavigate } from "react-router-dom";

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="login-shell">
      <section className="login-card" style={{ maxWidth: "800px" }}>
        <button
          type="button"
          className="button button-ghost"
          onClick={() => navigate(-1)}
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
