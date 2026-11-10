import { ImageResponse } from "next/og";

// Imagen al compartir un link de la web (Discord, WhatsApp, Reddit, X…).
// Solo texto y colores propios: sin arte del juego.
export const alt = "AoE2 Overlay: tu apertura paso a paso, encima del juego";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RED = "#e40038";
const CREAM = "#faf3e9";
const INK = "#201408";
const GOLD = "#e2b04a";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: INK,
        color: CREAM,
        borderBottom: `16px solid ${RED}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: GOLD }}>
        AGE OF EMPIRES II: DE
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 120, fontWeight: 800, letterSpacing: 2 }}>
          AOE2 OVERLAY
        </div>
        <div style={{ display: "flex", fontSize: 44, marginTop: 12, color: CREAM }}>
          Tu apertura, paso a paso, encima del juego
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 30, color: GOLD }}>
        Gratis · Open source · En español · Estrategias de la comunidad
      </div>
    </div>,
    size,
  );
}
