import { DOWNLOAD_URL } from "@/lib/config";
import { ShowcaseVideo } from "./ShowcaseVideo";

const STEPS = [
  ["Elegí mapa y civilización", "Te sugiere estrategias para tu civ y el mapa que te tocó."],
  ["Dale start", "El reloj sigue al del juego y cada paso aparece a su tiempo."],
  ["Seguí el ritmo", "Aldeanos, recursos y lo que viene después, sin salir del juego."],
];

/** Sección oscura con el video demo del overlay. */
export function Demo() {
  return (
    <section className="showcase-section dark grain" id="demo">
      <div className="frame-rule left" />
      <div className="frame-rule right" />
      <span className="side-label left" style={{ top: "50%" }}>
        02 / 05
      </span>
      <span className="side-label right" style={{ top: "50%" }}>
        Demo
      </span>

      <header className="showcase-head">
        <p className="showcase-eyebrow">En 40 segundos</p>
        <h2 className="showcase-title">Miralo en acción</h2>
      </header>

      <div className="showcase">
        <ShowcaseVideo
          src="/videos/aoe2-overlay-demo.mp4"
          poster="/videos/aoe2-overlay-demo.webp"
          label="Demo de AoE2 Overlay: elegir mapa y civilización, jugar con el reloj y ver las estrategias de la comunidad"
        />
        <div className="showcase-body">
          <ol className="showcase-steps">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className="showcase-num">{i + 1}</span>
                <div>
                  <p className="showcase-step-title">{title}</p>
                  <p className="showcase-text">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <a className="btn btn-gold" href={DOWNLOAD_URL}>
            ⬇ Descargar para Windows
          </a>
        </div>
      </div>
    </section>
  );
}
