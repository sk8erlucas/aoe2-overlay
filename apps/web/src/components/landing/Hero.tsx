"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { DOWNLOAD_URL, GITHUB_URL } from "@/lib/config";
import type { Me } from "@/lib/types";
import { Embers } from "./Embers";
import { StretchTitle } from "./StretchTitle";

const KNIGHT = "/game-assets/teutonic-knight.webp";

/** Pasos del panel de ejemplo (versión corta de strategies/scouts-feudal.json). */
const DEMO_STEPS = [
  { t: "0:00", text: "6 aldeanos a las ovejas" },
  { t: "1:15", text: "4 a madera con campamento" },
  { t: "2:55", text: "Atraer el primer jabalí" },
  { t: "4:30", text: "4 a bayas con molino" },
  { t: "7:30", text: "Telar y avanzar a Feudal" },
];

const LEFT_LABELS: [number, string][] = [
  [225, "01 / 05"],
  [560, "AOE2 OVERLAY"],
  [1010, "BUILD ORDERS"],
  [1180, "01 / 05"],
];
const RIGHT_LABELS: [number, string][] = [
  [225, "01 / 05"],
  [560, "BUILD ORDERS"],
  [1010, "AOE2 OVERLAY"],
  [1180, "01 / 05"],
];

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function Hero({ me }: { me: Me | null }) {
  const rootRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const knightRef = useRef<HTMLImageElement>(null);
  const glintRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  // --- Efecto con el scroll: el caballero emerge de la sombra y la cámara se acerca ---
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let p = reduced ? 1 : 0;
    let frame = 0;

    const apply = () => {
      const e = easeInOutCubic(p);
      const light = smooth(0.02, 0.45, p);
      if (innerRef.current) {
        innerRef.current.style.transform = `translateY(${-4 * e}%) scale(${1 + 0.16 * e})`;
      }
      if (knightRef.current) {
        knightRef.current.style.filter = `brightness(${0.22 + 0.78 * light}) saturate(${0.4 + 0.6 * light}) drop-shadow(0 ${20 * light}px ${30 * light}px rgba(40,0,10,${0.45 * light}))`;
      }
      if (haloRef.current) haloRef.current.style.opacity = String(0.9 * light);
      if (glintRef.current) {
        const s = clamp((p - 0.28) / 0.4);
        glintRef.current.style.backgroundPosition = `${100 - s * 100}% 0`;
        glintRef.current.style.opacity = String(Math.sin(Math.PI * s));
      }
      // Panel: un paso por tramo de scroll.
      const done = Math.floor(clamp((p - 0.1) / 0.6) * DEMO_STEPS.length);
      stepsRef.current?.querySelectorAll("li").forEach((li, i) => {
        li.classList.toggle("done", i < done);
        li.classList.toggle("current", i === Math.min(done, DEMO_STEPS.length - 1));
      });
      if (clockRef.current) {
        clockRef.current.textContent = DEMO_STEPS[Math.min(done, DEMO_STEPS.length - 1)]!.t;
      }
    };

    const loop = () => {
      const vh = window.innerHeight;
      const target = clamp((window.scrollY - 0.06 * vh) / (0.62 * vh));
      p += (target - p) * 0.2;
      if (Math.abs(target - p) < 0.0005) p = target;
      apply();
      frame = requestAnimationFrame(loop);
    };

    apply();
    if (!reduced) frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  // --- Animación de entrada (Web Animations) ---
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const easing = "cubic-bezier(.2,.8,.2,1)";
    root.querySelectorAll<HTMLElement>("[data-rise]").forEach((el, i) => {
      el.animate([{ transform: "translateY(102%)" }, { transform: "translateY(0)" }], {
        duration: 1100,
        delay: 150 + i * 140,
        easing,
        fill: "backwards",
      });
    });
    root.querySelector(".hero-topline")?.animate(
      [
        { transform: "translateY(16px)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 900, delay: 60, easing, fill: "backwards" },
    );
    root.querySelectorAll<HTMLElement>("[data-fade]").forEach((el, i) => {
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 700,
        delay: 120 + i * 25,
        easing,
        fill: "backwards",
      });
    });
    root.querySelector(".stage")?.animate(
      [
        { transform: "translate(-50%, 6%)", opacity: 0 },
        { transform: "translate(-50%, 0)", opacity: 1 },
      ],
      { duration: 1300, easing, fill: "backwards" },
    );
  }, []);

  return (
    <section ref={rootRef} className="hero grain" aria-label="AoE2 Overlay">
      <nav className="hero-nav">
        <Link href="/estrategias" data-fade>
          Estrategias
        </Link>
        <a href={DOWNLOAD_URL} data-fade>
          Descargar
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" data-fade>
          GitHub
        </a>
        <Link href={me ? "/perfil" : "/ingresar"} className="hero-account" data-fade>
          {me ? me.name : "Ingresar"}
        </Link>
      </nav>

      <div className="frame-rule left" />
      <div className="frame-rule right" />
      {LEFT_LABELS.map(([top, text], i) => (
        <span
          key={`l${i}`}
          className="side-label left"
          style={{ top: `calc(${top} * var(--u))` }}
          data-fade
        >
          {text}
        </span>
      ))}
      {RIGHT_LABELS.map(([top, text], i) => (
        <span
          key={`r${i}`}
          className="side-label right"
          style={{ top: `calc(${top} * var(--u))` }}
          data-fade
        >
          {text}
        </span>
      ))}

      <p className="hero-topline">Estrategias de apertura</p>

      <h1 className="sr-only">AoE2 Overlay</h1>
      <div className="title-line l1">
        <div data-rise style={{ height: "100%" }}>
          <StretchTitle text="AOE2" width={392} height={258} />
        </div>
      </div>
      <div className="title-line l2">
        <div data-rise style={{ height: "100%" }}>
          <StretchTitle text="OVERLAY" width={1120} height={266} />
        </div>
      </div>

      <div className="stage" style={{ ["--knight-src" as string]: `url(${KNIGHT})` }}>
        <div className="stage-inner" ref={innerRef}>
          <div className="stage-halo" ref={haloRef} />
          {/* <img> común (no next/image): es una capa animada con filtros por frame. */}
          <img ref={knightRef} className="knight" src={KNIGHT} alt="" draggable={false} />
          <div className="knight-glint" ref={glintRef} />
        </div>
      </div>

      <aside className="bo-panel" aria-label="Ejemplo del overlay" data-fade>
        <div className="bo-head">
          <span className="bo-clock" ref={clockRef}>
            0:00
          </span>
          <span style={{ fontSize: 12, opacity: 0.75 }}>Scouts · Alta Edad Media</span>
        </div>
        <ol ref={stepsRef} style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {DEMO_STEPS.map((s, i) => (
            <li key={i} className={`bo-step ${i === 0 ? "current" : ""}`}>
              <span className="tick">✓</span>
              <span className="txt">{s.text}</span>
            </li>
          ))}
        </ol>
      </aside>

      <Embers />
    </section>
  );
}
