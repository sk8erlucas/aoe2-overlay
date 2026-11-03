import { CIVS, MAPS } from "@age-overlay/game-data";
import { DEFAULT_SPEED } from "@age-overlay/shared";
import Image from "next/image";
import { DOWNLOAD_URL, GITHUB_URL } from "@/lib/config";

const CORNERS = [
  { left: "0%", top: "0%" },
  { left: "100%", top: "0%" },
  { left: "0%", top: "100%" },
  { left: "100%", top: "100%" },
];

const STATEMENT = [
  "AoE2 Overlay te guía paso a paso",
  "en tu apertura, encima del juego,",
  "sin tocar el juego ni su memoria.",
  "Elegí mapa y civilización, dale start",
  "y seguí el ritmo de los pros",
];

/** Sección crema: datos del proyecto y tarjeta de presentación con la descarga. */
export function About({ strategyCount }: { strategyCount: number | null }) {
  const stats = [
    { label: "Estrategias", value: strategyCount === null ? "—" : String(strategyCount) },
    { label: "Civilizaciones", value: String(CIVS.length) },
    { label: "Mapas", value: String(MAPS.length) },
    { label: "Velocidad del reloj", value: `${DEFAULT_SPEED}×` },
    { label: "Código (MIT)", value: "Abierto" },
    { label: "Precio", value: "Gratis" },
  ];

  return (
    <section className="about grain" id="que-es">
      <div className="frame-rule left" />
      <div className="frame-rule right" />

      <div className="biodata">
        <span className="side-label left" style={{ top: "50%" }}>
          El proyecto
        </span>
        <span className="side-label right" style={{ top: "50%" }}>
          02 / 03
        </span>
        <div>
          <p className="crest-label">[ AoE2 Overlay ]</p>
          <Image
            className="crest"
            src="/logo.svg"
            alt="Logo de AoE2 Overlay"
            width={232}
            height={232}
          />
        </div>
        <dl className="stats">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="stat-label">{s.label}</dt>
              <dd className="stat-value">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card-row">
        <span className="side-label left" style={{ top: "20%" }}>
          03 / 03
        </span>
        <span className="side-label left" style={{ top: "60%" }}>
          AoE2 Overlay
        </span>
        <span className="side-label right" style={{ top: "40%" }}>
          Descarga
        </span>
        <div className="intro-card">
          {CORNERS.map((c, i) => (
            <span key={i} className="corner" style={c} />
          ))}
          <Image className="intro-icon" src="/logo.svg" alt="" width={118} height={118} />
          <p className="statement">
            {STATEMENT.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className="intro-text">
            Gratis y de código abierto. Las estrategias las crea y las vota la comunidad, y podés
            auditar cada línea del código en GitHub.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a className="btn btn-gold" href={DOWNLOAD_URL}>
              ⬇ Descargar para Windows
            </a>
            <a className="btn btn-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">
              Ver el código
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
