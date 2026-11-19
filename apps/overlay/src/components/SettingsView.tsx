import { DEFAULT_SPEED } from "@age-overlay/shared";
import { useEffect, useState } from "react";
import type { Account } from "../lib/account";
import type { AvailableUpdate } from "../lib/updater";
import { AccountSection } from "./AccountSection";
import { UpdateSection } from "./UpdateSection";
import { searchProfiles, type CompanionProfile } from "../lib/detect";
import { listMonitors, type HotkeyError, type MonitorInfo } from "../lib/native";
import { LANG_LABELS, LANGS, useT, type Lang } from "../lib/i18n";
import {
  CORNERS,
  DEFAULT_HOTKEYS,
  LAYOUTS,
  type Corner,
  type Layout,
  HOTKEY_ACTIONS,
  type HotkeyAction,
  type Settings,
} from "../lib/settings";

interface Props {
  settings: Settings;
  hotkeyErrors: HotkeyError[];
  onChange: (patch: Partial<Settings>) => void;
  onResetPosition: () => void;
  onSyncNow: () => void;
  onQuit: () => void;
  account: Account | null;
  onLogin: (account: Account) => Promise<void>;
  onLogout: () => void;
  update: AvailableUpdate | null;
}

const SPEEDS = [
  { value: 1.0, label: "speed.slow" },
  { value: 1.5, label: "speed.casual" },
  { value: DEFAULT_SPEED, label: "speed.normal" },
  { value: 2.0, label: "speed.fast" },
] as const;

export function SettingsView({
  settings,
  hotkeyErrors,
  onChange,
  onResetPosition,
  onSyncNow,
  onQuit,
  account,
  onLogin,
  onLogout,
  update,
}: Props) {
  // Las hotkeys se editan como texto y se aplican al salir del campo.
  const t = useT();
  const [draft, setDraft] = useState(settings.hotkeys);
  const [monitors, setMonitors] = useState<MonitorInfo[]>([]);
  useEffect(() => {
    void listMonitors().then(setMonitors);
  }, []);

  const commitHotkey = (action: HotkeyAction) => {
    if (draft[action] !== settings.hotkeys[action]) {
      onChange({ hotkeys: { ...settings.hotkeys, [action]: draft[action].trim() } });
    }
  };

  const errorFor = (action: HotkeyAction) => hotkeyErrors.find((e) => e.action === action);

  return (
    <div className="settings">
      {update && <UpdateSection update={update} />}

      <h3>{t("settings.account")}</h3>
      <AccountSection account={account} onLogin={onLogin} onLogout={onLogout} />

      <h3>{t("settings.match")}</h3>
      <label>
        {t("settings.language")}
        <select value={settings.lang} onChange={(e) => onChange({ lang: e.target.value as Lang })}>
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {LANG_LABELS[l]}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t("settings.speed")}
        <select
          value={settings.speed}
          onChange={(e) => onChange({ speed: Number(e.target.value) })}
        >
          {SPEEDS.map((s) => (
            <option key={s.value} value={s.value}>
              {t(s.label)}
            </option>
          ))}
        </select>
      </label>

      <label>
        {t("settings.opacity", { n: Math.round(settings.opacity * 100) })}
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.05}
          value={settings.opacity}
          onChange={(e) => onChange({ opacity: Number(e.target.value) })}
        />
      </label>

      <label>
        {t("settings.scale", { n: Math.round(settings.scale * 100) })}
        <input
          type="range"
          min={0.8}
          max={1.5}
          step={0.05}
          value={settings.scale}
          onChange={(e) => onChange({ scale: Number(e.target.value) })}
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={settings.sound}
          onChange={(e) => onChange({ sound: e.target.checked })}
        />
        {t("settings.sound")}
      </label>

      <DetectSection settings={settings} onChange={onChange} loggedIn={!!account} />

      <h3>{t("settings.screen")}</h3>
      <label>
        {t("settings.layout")}
        <select
          value={settings.layout}
          onChange={(e) => onChange({ layout: e.target.value as Layout })}
        >
          {LAYOUTS.map((l) => (
            <option key={l} value={l}>
              {t(`layout.${l}`)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t("settings.corner")}
        <select
          value={settings.corner}
          onChange={(e) => onChange({ corner: e.target.value as Corner })}
        >
          {CORNERS.map((c) => (
            <option key={c} value={c}>
              {t(`corner.${c}`)}
            </option>
          ))}
        </select>
      </label>
      {monitors.length > 1 && (
        <label>
          {t("settings.monitor")}
          <select
            value={settings.monitor ?? ""}
            onChange={(e) =>
              onChange({ monitor: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          >
            <option value="">{t("settings.primaryMonitor")}</option>
            {monitors.map((m) => (
              <option key={m.index} value={m.index}>
                {m.index + 1}. {m.name} ({m.width}×{m.height})
                {m.primary ? t("settings.primarySuffix") : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="row">
        <button onClick={onResetPosition}>{t("settings.resetPosition")}</button>
      </div>

      <h3>{t("settings.hotkeys")}</h3>
      <p className="muted">
        {t("settings.hotkeysHelp")} <code>Control+Alt+P</code>, <code>Shift+F2</code>,{" "}
        <code>Control+Alt+PageDown</code>.
      </p>
      <div className="hotkeys">
        {HOTKEY_ACTIONS.map((action) => {
          const error = errorFor(action);
          return (
            <label key={action} className={error ? "invalid" : ""}>
              {t(`hotkey.${action}`)}
              <input
                value={draft[action]}
                onChange={(e) => setDraft({ ...draft, [action]: e.target.value })}
                onBlur={() => commitHotkey(action)}
                onKeyDown={(e) => e.key === "Enter" && commitHotkey(action)}
                spellCheck={false}
              />
              {error && (
                <span className="error">
                  {t("settings.hotkeyError", { message: error.message })}
                </span>
              )}
            </label>
          );
        })}
      </div>

      <div className="row">
        <button
          onClick={() => {
            setDraft(DEFAULT_HOTKEYS);
            onChange({ hotkeys: DEFAULT_HOTKEYS });
          }}
        >
          {t("settings.resetHotkeys")}
        </button>
      </div>

      <h3>{t("settings.community")}</h3>
      <div className="row">
        <button onClick={onSyncNow}>{t("settings.syncNow")}</button>
      </div>

      <h3>{t("settings.app")}</h3>
      <div className="row">
        <button className="danger" onClick={onQuit}>
          {t("settings.quit")}
        </button>
      </div>
    </div>
  );
}

/** Detección automática: el usuario busca su perfil de AoE2 Companion por nombre. */
function DetectSection({
  settings,
  onChange,
  loggedIn,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  loggedIn: boolean;
}) {
  const t = useT();
  const detect = settings.detect;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanionProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setDetect = (patch: Partial<Settings["detect"]>) =>
    onChange({ detect: { ...detect, ...patch } });

  const search = async () => {
    if (query.trim().length < 2) return;
    setError(null);
    try {
      setResults(await searchProfiles(query));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <>
      <h3>{t("detectSettings.title")}</h3>
      <p className="muted">{t("detectSettings.help")}</p>
      {detect.profileId ? (
        <div className="row">
          <span>
            {t("detectSettings.player")} <strong>{detect.profileName ?? detect.profileId}</strong>
          </span>
          <button onClick={() => setDetect({ profileId: undefined, profileName: undefined })}>
            {t("detectSettings.remove")}
          </button>
        </div>
      ) : (
        <>
          <div className="row">
            <input
              className="search"
              placeholder={t("detectSettings.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void search()}
            />
            <button onClick={() => void search()}>{t("detectSettings.search")}</button>
          </div>
          {error && <span className="error">{error}</span>}
          {results &&
            (results.length === 0 ? (
              <p className="muted">{t("detectSettings.notFound")}</p>
            ) : (
              <ul className="profiles">
                {results.map((p) => (
                  <li key={p.profileId}>
                    <button
                      onClick={() => {
                        setDetect({ profileId: p.profileId, profileName: p.name });
                        setResults(null);
                        setQuery("");
                      }}
                    >
                      {p.name}
                      {p.country ? ` · ${p.country.toUpperCase()}` : ""}
                      {p.games ? t("detectSettings.games", { n: p.games }) : ""}
                    </button>
                  </li>
                ))}
              </ul>
            ))}
        </>
      )}
      <label className="checkbox">
        <input
          type="checkbox"
          checked={detect.autoStart}
          onChange={(e) => setDetect({ autoStart: e.target.checked })}
        />
        {t("detectSettings.autoStart")}
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={detect.autoReport}
          onChange={(e) => setDetect({ autoReport: e.target.checked })}
        />
        {t("detectSettings.autoReport")}
        {!loggedIn && t("detectSettings.needsLogin")}
      </label>
    </>
  );
}
