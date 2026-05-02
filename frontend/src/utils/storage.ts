import { ReportData } from "../types/report";
import { hydrateReportData } from "./reportHelpers";

const STORAGE_KEY = "serenita-cm:last-report";

export function saveReportToStorage(data: ReportData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadReportFromStorage(): ReportData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return hydrateReportData(JSON.parse(raw) as Partial<ReportData>);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
