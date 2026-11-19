import { DEFAULT_SPEED } from "@age-overlay/shared";
import { useEffect, useState } from "react";
import type { Account } from "../lib/account";
import type { AvailableUpdate } from "../lib/updater";
import { AccountSection } from "./AccountSection";
import { UpdateSection } from "./UpdateSection";
import { listMonitors, type HotkeyError, type MonitorInfo } from "../lib/native";
import {
  CORNER_LABELS,
  CORNERS,
  DEFAULT_HOTKEYS,
  LAYOUT_LABELS,
  LAYOUTS,
  type Corner,
  type Layout,
  HOTKEY_ACTIONS,
  HOTKEY_LABELS,
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
  { value: 1.0, label: "Lenta (1.0)" },
  { value: 1.5, label: "Casual (1.5)" },
  { value: DEFAULT_SPEED, label: "Normal (1.7)" },
  { value: 2.0, label: "Rápida (2.0)" },
];

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

      <h3>Cuenta</h3>
      <AccountSection account={account} onLogin={onLogin} onLogout={onLogout} />

      <h3>Partida</h3>
      <label>
        Velocidad de la partida
        <select
          value={settings.speed}
          onChange={(e) => onChange({ speed: Number(e.target.value) })}
        >
          {SPEEDS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Opacidad del fondo: {Math.round(settings.opacity * 100)}%
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
        Tamaño del texto: {Math.round(settings.scale * 100)}%
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
        Sonido al cambiar de paso
      </label>

      <h3>Pantalla</h3>
      <label>
        Diseño durante la partida
        <select
          value={settings.layout}
          onChange={(e) => onChange({ layout: e.target.value as Layout })}
        >
          {LAYOUTS.map((l) => (
            <option key={l} value={l}>
              {LAYOUT_LABELS[l]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Esquina
        <select
          value={settings.corner}
          onChange={(e) => onChange({ corner: e.target.value as Corner })}
        >
          {CORNERS.map((c) => (
            <option key={c} value={c}>
              {CORNER_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      {monitors.length > 1 && (
        <label>
          Monitor
          <select
            value={settings.monitor ?? ""}
            onChange={(e) =>
              onChange({ monitor: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          >
            <option value="">El principal</option>
            {monitors.map((m) => (
              <option key={m.index} value={m.index}>
                {m.index + 1}. {m.name} ({m.width}×{m.height}){m.primary ? " · principal" : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="row">
        <button onClick={onResetPosition}>Volver a la esquina</button>
      </div>

      <h3>Atajos de teclado</h3>
      <p className="muted">
        Funcionan aunque el juego tenga el foco. Formato: <code>Control+Alt+P</code>,{" "}
        <code>Shift+F2</code>, <code>Control+Alt+PageDown</code>.
      </p>
      <div className="hotkeys">
        {HOTKEY_ACTIONS.map((action) => {
          const error = errorFor(action);
          return (
            <label key={action} className={error ? "invalid" : ""}>
              {HOTKEY_LABELS[action]}
              <input
                value={draft[action]}
                onChange={(e) => setDraft({ ...draft, [action]: e.target.value })}
                onBlur={() => commitHotkey(action)}
                onKeyDown={(e) => e.key === "Enter" && commitHotkey(action)}
                spellCheck={false}
              />
              {error && <span className="error">No se pudo registrar: {error.message}</span>}
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
          Restaurar atajos
        </button>
      </div>

      <h3>Estrategias de la comunidad</h3>
      <div className="row">
        <button onClick={onSyncNow}>Sincronizar ahora</button>
      </div>

      <h3>Aplicación</h3>
      <div className="row">
        <button className="danger" onClick={onQuit}>
          Salir de AoE2 Overlay
        </button>
      </div>
    </div>
  );
}
