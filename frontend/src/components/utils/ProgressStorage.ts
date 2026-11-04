import type { PracticeSettingsModel, ProgressModel } from "../models/ProgressModel.ts";

const PROGRESS_KEY = "evp-pi.progress.v1";
const SETTINGS_KEY = "evp-pi.settings.v1";

const DEFAULT_SETTINGS: PracticeSettingsModel = { ratingFilter: "alle", category: "alle" };

function read<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function write(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // z. B. privater Modus: Fortschritt gilt dann nur bis zum Neuladen
    }
}

export function loadProgress(): ProgressModel {
    return read<ProgressModel>(PROGRESS_KEY, {});
}

export function saveProgress(progress: ProgressModel): void {
    write(PROGRESS_KEY, progress);
}

export function loadSettings(): PracticeSettingsModel {
    return { ...DEFAULT_SETTINGS, ...read<Partial<PracticeSettingsModel>>(SETTINGS_KEY, {}) };
}

export function saveSettings(settings: PracticeSettingsModel): void {
    write(SETTINGS_KEY, settings);
}

export function resetProgress(): void {
    try {
        localStorage.removeItem(PROGRESS_KEY);
    } catch {
        // nichts zu tun
    }
}

/** Fortschritt als Datei herunterladen */
export function exportProgress(progress: ProgressModel): void {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `linux-kannliste-fortschritt-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

/** Datei einlesen, gibt null zurück, wenn sie kein gültiger Fortschritt ist */
export async function importProgress(file: File): Promise<ProgressModel | null> {
    try {
        const data: unknown = JSON.parse(await file.text());
        if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
        return data as ProgressModel;
    } catch {
        return null;
    }
}
