import { DEFAULT_SPEED } from "@age-overlay/shared";
import { useState } from "react";
import type { HotkeyError } from "../lib/native";
import {
  DEFAULT_HOTKEYS,
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
}

const SPEEDS = [
  { value: 1.0, label: "Lenta (1.0)" },
  { value: 1.5, label: "Casual (1.5)" },
  { value: DEFAULT_SPEED, label: "Normal (1.7)" },
  { value: 2.0, label: "Rápida (2.0)" },
];

export function SettingsView({ settings, hotkeyErrors, onChange, onResetPosition }: Props) {
  // Las hotkeys se editan como texto y se aplican al salir del campo.
  const [draft, setDraft] = useState(settings.hotkeys);

  const commitHotkey = (action: HotkeyAction) => {
    if (draft[action] !== settings.hotkeys[action]) {
      onChange({ hotkeys: { ...settings.hotkeys, [action]: draft[action].trim() } });
    }
  };

  const errorFor = (action: HotkeyAction) => hotkeyErrors.find((e) => e.action === action);

  return (
    <div className="settings">
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
        <button onClick={onResetPosition}>Volver a la esquina</button>
      </div>
    </div>
  );
}
