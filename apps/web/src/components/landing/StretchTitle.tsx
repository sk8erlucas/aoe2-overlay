"use client";

import { useEffect, useRef, useState } from "react";

/** Proporción típica altura-de-mayúsculas / tamaño de fuente de Anton, hasta medirla. */
const DEFAULT_CAP_RATIO = 0.72;

/**
 * Texto en Anton estirado para llenar exactamente su caja:
 * - alto: el tamaño de fuente se calcula para que las mayúsculas ocupen todo el alto
 *   (se mide la altura de mayúsculas real con un canvas cuando la fuente cargó);
 * - ancho: SVG `textLength` + `lengthAdjust="spacingAndGlyphs"`.
 */
export function StretchTitle({
  text,
  width,
  height,
}: {
  text: string;
  width: number;
  height: number;
}) {
  const textRef = useRef<SVGTextElement>(null);
  const [capRatio, setCapRatio] = useState(DEFAULT_CAP_RATIO);

  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      const el = textRef.current;
      if (!el || cancelled) return;
      const family = getComputedStyle(el).fontFamily;
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `100px ${family}`;
      const ascent = ctx.measureText("H").actualBoundingBoxAscent;
      if (ascent > 0) setCapRatio(ascent / 100);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label={text} role="img">
      <text
        ref={textRef}
        x={0}
        y={height}
        fontSize={height / capRatio}
        textLength={width}
        lengthAdjust="spacingAndGlyphs"
      >
        {text}
      </text>
    </svg>
  );
}
