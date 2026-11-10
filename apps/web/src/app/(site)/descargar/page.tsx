import type { Metadata } from "next";
import { DOWNLOAD_URL, GITHUB_URL } from "@/lib/config";

export const metadata: Metadata = { title: "Descargar" };

const HOTKEYS: [string, string][] = [
  ["Ctrl + Alt + O", "Modo edición ↔ modo juego (en juego los clics atraviesan el overlay)"],
  ["Ctrl + Alt + P", "Iniciar / pausar el reloj"],
  ["Ctrl + Alt + R", "Reiniciar el reloj"],
  ["Ctrl + Alt + L / J", "Adelantar / atrasar 5 segundos"],
  ["Ctrl + Alt + PageDown / PageUp", "Paso siguiente / anterior"],
  ["Ctrl + Alt + H", "Mostrar / ocultar"],
];

const STEPS = [
  ["Descargá el instalador", "Bajá el archivo .exe del último release en GitHub."],
  [
    "Instalalo",
    "Windows puede mostrar el aviso de SmartScreen porque el instalador todavía no está firmado. Elegí «Más información» → «Ejecutar de todas formas». El código es abierto: podés revisarlo antes.",
  ],
  [
    "Elegí tu partida",
    "El overlay aparece arriba a la derecha. Elegí mapa, civilización, rival y una estrategia sugerida.",
  ],
  [
    "Jugá",
    "Tocá «Jugar», y cuando arranque la partida apretá Ctrl + Alt + P. El overlay va mostrando cada paso a tiempo.",
  ],
];

export default function DownloadPage() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="label text-xs text-red">Windows 10 / 11 · Gratis · Open source</p>
          <h1 className="font-display text-5xl tracking-wide md:text-6xl">DESCARGAR</h1>
          <a className="btn btn-gold" href={DOWNLOAD_URL}>
            ⬇ Descargar para Windows
          </a>
        </header>

        <ol className="space-y-4">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="card flex gap-4 p-5">
              <span className="font-display text-4xl leading-none text-red">{i + 1}</span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-ink/70">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="label mb-3 text-sm text-red">Atajos de teclado</h2>
          <dl className="space-y-2 text-sm">
            {HOTKEYS.map(([k, v]) => (
              <div key={k}>
                <dt>
                  <kbd className="rounded bg-ink/10 px-1.5 py-0.5 font-mono text-xs">{k}</kbd>
                </dt>
                <dd className="text-ink/70">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-ink/50">
            Se pueden cambiar en Ajustes dentro del overlay.
          </p>
        </div>
        <div className="card space-y-2 p-5 text-sm">
          <h2 className="label text-sm text-red">¿Es seguro?</h2>
          <p className="text-ink/70">
            El overlay es una ventana común «siempre encima»: no se inyecta en el juego ni lee su
            memoria. Todo el código está en{" "}
            <a className="underline" href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            .
          </p>
        </div>
        <div className="card space-y-2 p-5 text-sm">
          <h2 className="label text-sm text-red">Firma de código</h2>
          <p className="text-ink/70">
            El instalador todavía no está firmado. Cada versión publica{" "}
            <code className="font-mono text-xs">SHA256SUMS.txt</code> en GitHub para que puedas
            comprobar que el archivo es el original. Mirá la{" "}
            <a
              className="underline"
              href={`${GITHUB_URL}/blob/main/CODE_SIGNING.md`}
              target="_blank"
              rel="noreferrer"
            >
              política de firma
            </a>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}
