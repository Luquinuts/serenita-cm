from __future__ import annotations

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import CSS, HTML

from app.schemas import ReportInput


BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
CIRCUMFERENCE = 2 * 3.141592653589793 * 44

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
    trim_blocks=True,
    lstrip_blocks=True,
)


def _parse_percentage(value: str) -> float:
    cleaned = value.replace("%", "").replace(",", ".").strip()
    try:
        parsed = float(cleaned)
    except ValueError:
        return 0.0
    return max(0.0, min(parsed, 100.0))


def _platform_pills(plataforma: str) -> list[str]:
    if "&" in plataforma:
        return [item.strip() for item in plataforma.split("&") if item.strip()]
    if "/" in plataforma:
        return [item.strip() for item in plataforma.split("/") if item.strip()]
    return [plataforma.strip() or "Plataforma"]


def _insight_icon(index: int) -> str:
    return ["✦", "▣", "◌", "★"][index % 4]


def _build_context(report: ReportInput) -> dict[str, Any]:
    top_publicaciones = []
    for index, publication in enumerate(report.topPublicaciones[:3]):
        metricas = [metrica for metrica in publication.metricas if metrica.label.strip() or metrica.valor.strip()][:5]
        if not publication.titulo.strip() and not metricas:
            continue
        top_publicaciones.append(
            {
                "orden": publication.orden or index + 1,
                "tipo": publication.tipo or "Publicación",
                "titulo": publication.titulo or "Sin título",
                "metricas": metricas,
            }
        )

    ubicaciones = [item for item in report.audiencia.ubicaciones if item.nombre.strip() or item.porcentaje.strip()][:6]
    edades = [item for item in report.audiencia.edades if item.rango.strip() or item.porcentaje.strip()][:6]
    insights = [insight for insight in report.insightsAdicionales if insight.strip()][:4]
    suggestions = [item for item in report.sugerenciasProximoMes if item.strip()][:6]
    mujeres = _parse_percentage(report.audiencia.genero.mujeres)
    hombres = _parse_percentage(report.audiencia.genero.hombres)
    women_arc = (mujeres / 100.0) * CIRCUMFERENCE
    men_base = hombres or max(0.0, 100.0 - mujeres)
    men_arc = (men_base / 100.0) * CIRCUMFERENCE

    return {
        "report": report,
        "platform_pills": _platform_pills(report.plataforma),
        "top_publicaciones": top_publicaciones,
        "ubicaciones": ubicaciones,
        "edades": edades,
        "insights": [{"text": insight, "icon": _insight_icon(index)} for index, insight in enumerate(insights)],
        "suggestions": [{"text": item, "icon": _insight_icon(index)} for index, item in enumerate(suggestions)],
        "show_gender": bool(report.audiencia.genero.mujeres.strip() or report.audiencia.genero.hombres.strip()),
        "mujeres_pct": mujeres,
        "hombres_pct": men_base,
        "women_arc": women_arc,
        "men_arc": men_arc,
        "circumference": CIRCUMFERENCE,
    }


def render_report_html(report: ReportInput) -> str:
    template = jinja_env.get_template("report.html")
    return template.render(**_build_context(report))


def generate_report_pdf(report: ReportInput) -> bytes:
    html_string = render_report_html(report)
    base_url = str(STATIC_DIR)
    css = CSS(filename=str(STATIC_DIR / "pdf.css"))
    pdf = HTML(string=html_string, base_url=base_url).write_pdf(stylesheets=[css])
    return pdf
