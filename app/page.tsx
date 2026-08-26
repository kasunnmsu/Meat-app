"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { clearAllSurveyDrafts } from "@/lib/surveyDraft";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import {
  getLocationColor,
  getLocationConfig,
  STUDY_LOCATIONS,
} from "@/lib/locations";
import {
  flushPending,
  getLocalBackups,
  getLocalBackupStats,
  getPendingCount,
  type LocalBackupStats,
} from "@/lib/saveWithRetry";
import {
  DEVICE_LAYOUT_CHANGE_EVENT,
  DEVICE_LAYOUT_STORAGE_KEY,
  isDeviceSettingsPinValid,
  normalizeDeviceLayoutProfile,
  type DeviceLayoutProfile,
} from "@/lib/deviceLayout";

function createParticipantId(location: string) {
  const prefix = location.replace(/\s+/g, "").toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}-${Date.now()}-${random}`;
}

function clearPreviousParticipantData() {
  clearAllSurveyDrafts();
  localStorage.removeItem("participantId");
  localStorage.removeItem("participantLocation");
  localStorage.removeItem("surveyMode");
  localStorage.removeItem("surveyStartedAt");
  localStorage.removeItem("selectedSessionPath");

  localStorage.removeItem("session-1-ranking");
  localStorage.removeItem("session-1-demographics");

  localStorage.removeItem("session-2-ranking");
  localStorage.removeItem("session-2-demographics");
  localStorage.removeItem("session-2-seal-readings");

  localStorage.removeItem("session-3-ranking");
  localStorage.removeItem("session-3-demographics");
}

function csvEscape(value: unknown) {
  const text =
    value === null || value === undefined
      ? ""
      : typeof value === "string"
        ? value
        : JSON.stringify(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadBlobFile(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function flattenBackupRows(backups: Awaited<ReturnType<typeof getLocalBackups>>) {
  return backups.map((item) => ({
    id: item.id,
    url: item.url,
    createdAt: item.createdAt,
    body: JSON.stringify(item.body),
  }));
}

export default function HomePage() {
  const router = useRouter();
  const { t, setLanguage } = useLanguage();
  const [location, setLocation] = useState("PUCPR");
  const [participantId, setParticipantId] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [backupStats, setBackupStats] = useState<LocalBackupStats>({
    backupCount: 0,
    participantCount: 0,
    eventCount: 0,
    lastSavedAt: "",
  });
  const [syncingPending, setSyncingPending] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);
  const [tabletPinRequested, setTabletPinRequested] = useState(false);
  const [deviceSettingsPin, setDeviceSettingsPin] = useState("");
  const [deviceSettingsError, setDeviceSettingsError] = useState("");
  const [deviceLayoutProfile, setDeviceLayoutProfile] =
    useState<DeviceLayoutProfile>("current");

  useEffect(() => {
    setDeviceLayoutProfile(
      normalizeDeviceLayoutProfile(
        localStorage.getItem(DEVICE_LAYOUT_STORAGE_KEY)
      )
    );
  }, []);

  useEffect(() => {
    setLanguage(getLocationConfig(location).language);
  }, [location, setLanguage]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function refreshBackupPanel() {
      const [count, stats] = await Promise.all([
        getPendingCount(),
        getLocalBackupStats(),
      ]);

      if (!cancelled) {
        setPendingCount(count);
        setBackupStats(stats);
      }
    }

    refreshBackupPanel();
    timer = setInterval(refreshBackupPanel, 5000);
    window.addEventListener("focus", refreshBackupPanel);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      window.removeEventListener("focus", refreshBackupPanel);
    };
  }, []);

  function saveParticipant(id: string) {
    localStorage.setItem("participantId", id);
    localStorage.setItem("participantLocation", location);
    localStorage.setItem("surveyMode", "full");
    localStorage.setItem("selectedSessionPath", "/session-1");
  }

  function handleCreateUser() {
    clearPreviousParticipantData();

    const id = createParticipantId(location);
    setParticipantId(id);
    saveParticipant(id);
  }

  function handleEnter() {
    let id = participantId;

    if (!id) {
      clearPreviousParticipantData();
      id = createParticipantId(location);
      setParticipantId(id);
      saveParticipant(id);
    }

    router.push("/session-1");
  }

  async function handleSyncPending() {
    setSyncingPending(true);
    setHelpMessage("");

    const result = await flushPending();
    const stats = await getLocalBackupStats();

    setPendingCount(result.remaining);
    setBackupStats(stats);
    setSyncingPending(false);
    setHelpMessage(
      result.remaining === 0
        ? "Todos os envios pendentes foram sincronizados."
        : `${result.remaining} envio(s) ainda pendente(s).`
    );
  }

  function buildBackupCsv(rows: ReturnType<typeof flattenBackupRows>) {
    const columns = ["id", "url", "createdAt", "body"];

    return [
      columns.map(csvEscape).join(","),
      ...rows.map((row) =>
        columns.map((column) => csvEscape(row[column as keyof typeof row])).join(",")
      ),
    ].join("\r\n");
  }

  async function handleExportBackup() {
    const backups = await getLocalBackups();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const exportedAt = new Date().toISOString();
    const rows = flattenBackupRows(backups);
    const csv = buildBackupCsv(rows);
    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const statsWorksheet = XLSX.utils.json_to_sheet([
      {
        exportedAt,
        backupCount: backups.length,
        participantCount: backupStats.participantCount,
        eventCount: backupStats.eventCount,
      },
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Backups");
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, "Resumo");

    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });

    downloadBlobFile(
      `backup-local-${timestamp}.xlsx`,
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );

    downloadTextFile(
      `backup-local-${timestamp}.json`,
      JSON.stringify(
        {
          exportedAt,
          backupCount: backups.length,
          backups,
        },
        null,
        2
      ),
      "application/json"
    );

    downloadTextFile(
      `backup-local-${timestamp}.csv`,
      `${csv}\r\n`,
      "text/csv;charset=utf-8"
    );

    setBackupStats(await getLocalBackupStats());
  }

  function saveDeviceLayoutProfile() {
    localStorage.setItem(DEVICE_LAYOUT_STORAGE_KEY, deviceLayoutProfile);
    window.dispatchEvent(new Event(DEVICE_LAYOUT_CHANGE_EVENT));
    closeDeviceSettings();
  }

  function closeDeviceSettings() {
    setDeviceSettingsOpen(false);
    setTabletPinRequested(false);
    setDeviceSettingsPin("");
    setDeviceSettingsError("");
  }

  function toggleDeviceSettings() {
    if (deviceSettingsOpen) {
      closeDeviceSettings();
      return;
    }

    setDeviceSettingsOpen(true);
    setTabletPinRequested(false);
    setDeviceSettingsPin("");
    setDeviceSettingsError("");
  }

  function requestTabletProfileAccess() {
    setTabletPinRequested(true);
    setDeviceSettingsPin("");
    setDeviceSettingsError("");
  }

  function selectAutomaticProfile() {
    setDeviceLayoutProfile("automatic");
    setTabletPinRequested(false);
    setDeviceSettingsPin("");
    setDeviceSettingsError("");
  }

  function unlockDeviceSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isDeviceSettingsPinValid(deviceSettingsPin)) {
      setDeviceSettingsError("PIN incorreto.");
      return;
    }

    setDeviceLayoutProfile("current");
    setTabletPinRequested(false);
    setDeviceSettingsPin("");
    setDeviceSettingsError("");
  }

  const actionColor = getLocationColor(location);

  return (
    <main className="home-page">
      <div className="home-illustration">
        <div className="home-logos">
          <Image src="/images/logos/pucpr.png" alt="PUCPR" width={200} height={200} className="home-logo-pucpr" priority />
          <Image src="/images/logos/nmsu.png" alt="NMSU" width={200} height={200} className="home-logo-nmsu" />
          <Image src="/images/logos/ufba.png" alt="UFBA" width={200} height={200} className="home-logo-ufba" />
        </div>

        <div className="home-card">
          <h1>{t("home.welcome")}</h1>

          <label className="home-location-field">
            <span>{t("start.location")}</span>

            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              {STUDY_LOCATIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="home-secondary-btn"
            onClick={handleCreateUser}
          >
            {t("home.createUser")}
          </button>

          {participantId && (
            <div className="participant-id-box">
              <span>{t("start.currentId")}</span>
              <strong>{participantId}</strong>
            </div>
          )}

          <button
            type="button"
            className="home-primary-btn"
            style={{ background: actionColor }}
            onClick={handleEnter}
          >
            <span>{t("home.enter")}</span>
          </button>
        </div>
      </div>

      <div className="device-settings-widget">
        <button
          type="button"
          className="device-settings-button"
          aria-label="Configurações de tela"
          aria-expanded={deviceSettingsOpen}
          onClick={toggleDeviceSettings}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2.83 2.83-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-4v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06-2.83-2.83.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3v-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06 2.83-2.83.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3h4v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06 2.83 2.83-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21v4h-.09A1.65 1.65 0 0 0 19.4 15Z" />
          </svg>
        </button>

        {deviceSettingsOpen && (
          <section className="device-settings-panel" aria-label="Configurações de tela">
            <strong>Perfil deste aparelho</strong>
            <p>Escolha como o conteúdo será ajustado nesta tela.</p>

            <label onClick={requestTabletProfileAccess}>
              <input
                type="radio"
                name="device-layout-profile"
                value="current"
                checked={deviceLayoutProfile === "current"}
                onChange={() => undefined}
              />
              <span>
                <strong>Perfil para Tablet</strong>
                <small>Configuração para tablets exclusivos da PUCPR e UFBA.</small>
              </span>
            </label>

            {tabletPinRequested && (
              <div className="device-settings-pin-request">
                <p>Digite o PIN para selecionar o perfil de tablet.</p>
                <form
                  className="device-settings-pin-form"
                  onSubmit={unlockDeviceSettings}
                >
                  <label
                    className="device-settings-pin-label"
                    htmlFor="device-settings-pin"
                  >
                    PIN de acesso
                  </label>
                  <input
                    id="device-settings-pin"
                    type="password"
                    value={deviceSettingsPin}
                    onChange={(event) => {
                      setDeviceSettingsPin(event.target.value);
                      setDeviceSettingsError("");
                    }}
                    autoComplete="off"
                    autoFocus
                  />
                  {deviceSettingsError && (
                    <small className="device-settings-error" role="alert">
                      {deviceSettingsError}
                    </small>
                  )}
                  <button type="submit">Acessar configurações</button>
                </form>
              </div>
            )}

            <label>
              <input
                type="radio"
                name="device-layout-profile"
                value="automatic"
                checked={deviceLayoutProfile === "automatic"}
                onChange={selectAutomaticProfile}
              />
              <span>
                <strong>Ajuste automático</strong>
                <small>Adapta o conteúdo ao tamanho e à orientação da tela.</small>
              </span>
            </label>

            <button type="button" onClick={saveDeviceLayoutProfile}>
              Salvar configuração
            </button>
          </section>
        )}
      </div>

      <div className="help-widget">
        <button
          type="button"
          className="help-button"
          onClick={() => setHelpOpen((open) => !open)}
        >
          Help
          {pendingCount > 0 && (
            <span className="help-badge">{pendingCount}</span>
          )}
        </button>

        {helpOpen && (
          <div className="help-panel">
            <strong>Backup local</strong>
            <p>
              {pendingCount === 0
                ? "Nenhum envio pendente no tablet."
                : `${pendingCount} envio(s) aguardando sincronização.`}
            </p>
            <div className="help-stats">
              <span>Participantes: {backupStats.participantCount}</span>
              <span>
                Último dado salvo: {" "}
                {backupStats.lastSavedAt
                  ? new Date(backupStats.lastSavedAt).toLocaleString("pt-BR")
                  : "nenhum"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSyncPending}
              disabled={syncingPending || pendingCount === 0}
            >
              {syncingPending ? "Sincronizando..." : "Tentar reenviar"}
            </button>

            <button
              type="button"
              onClick={handleExportBackup}
              disabled={backupStats.backupCount === 0}
            >
              Exportar backup
            </button>

            {helpMessage && <small>{helpMessage}</small>}
          </div>
        )}
      </div>
    </main>
  );
}
