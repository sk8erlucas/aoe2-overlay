"use client";

import { useEffect, useRef } from "react";

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  hue: number;
  phase: number;
}

const COUNT = 70;

/**
 * Brasas doradas que suben por el hero (canvas 2D, sin video).
 * Se pausan fuera de pantalla y con "reducir movimiento".
 */
export function Embers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const spawn = (initial: boolean): Ember => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.35 + Math.random() * 0.9),
      r: 0.8 + Math.random() * 2.6,
      life: 0.4 + Math.random() * 0.6,
      hue: 30 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
    });
    const embers = Array.from({ length: COUNT }, () => spawn(true));

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible) frame = requestAnimationFrame(tick);
    });
    io.observe(canvas);

    let frame = 0;
    let t = 0;
    function tick() {
      if (!visible) return;
      t += 1;
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i]!;
        e.x += e.vx + Math.sin(t * 0.02 + e.phase) * 0.35;
        e.y += e.vy;
        if (e.y < -10) embers[i] = spawn(false);
        const flicker = 0.55 + 0.45 * Math.sin(t * 0.1 + e.phase);
        const alpha = e.life * flicker * Math.min(1, e.y / (height * 0.25));
        const g = ctx!.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 3);
        g.addColorStop(0, `hsla(${e.hue}, 100%, 75%, ${alpha})`);
        g.addColorStop(1, `hsla(${e.hue}, 100%, 55%, 0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, e.r * 3, 0, Math.PI * 2);
        ctx!.fill();
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="embers" aria-hidden />;
}
