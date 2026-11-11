import { REPLAYS_REPO, replaysLink } from "@/lib/config";
import { ShowcaseVideo } from "./ShowcaseVideo";

const POINTS = [
  "Mirá cualquier partida en el mapa con los gráficos del juego: cada civilización con su arquitectura, aldeanos trabajando y ejércitos en marcha.",
  "Buscá a cualquier jugador y abrí sus partidas online, sin subir nada. O subí tu archivo .aoe2record.",
  "Analizá a cada jugador: APM, cuándo avanzó de edad y su build order completo.",
  "Copiá la partida como texto para preguntarle a una IA qué pasó.",
];

/** Proyecto hermano: AoE2 Replays, con su video. Los links llevan UTM para medir las visitas. */
export function ReplaysShowcase() {
  return (
    <section className="showcase-section dark grain" id="replays">
      <div className="frame-rule left" />
      <div className="frame-rule right" />
      <span className="side-label left" style={{ top: "50%" }}>
        05 / 05
      </span>
      <span className="side-label right" style={{ top: "50%" }}>
        Más herramientas
      </span>

      <header className="showcase-head">
        <p className="showcase-eyebrow">Más herramientas</p>
        <h2 className="showcase-title">AoE2 Replays</h2>
        <p className="showcase-lead">
          Reviví tus partidas de Age of Empires II: mirá qué hizo cada jugador y cuándo.
        </p>
      </header>

      <div className="showcase reverse">
        <ShowcaseVideo
          src="/videos/aoe2-replays-demo.mp4"
          poster="/videos/aoe2-replays-demo.webp"
          label="Demo de AoE2 Replays: una partida reproducida en el mapa y el análisis de cada jugador"
        />
        <div className="showcase-body">
          <ul className="showcase-points">
            {POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="showcase-text">
            Gratis, en el navegador y de código abierto. Es otro proyecto de fans, hecho por el
            mismo equipo.
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="btn btn-gold" href={replaysLink("/")}>
              Abrir AoE2 Replays
            </a>
            <a className="btn btn-ghost" href={REPLAYS_REPO} target="_blank" rel="noreferrer">
              Ver el código
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
