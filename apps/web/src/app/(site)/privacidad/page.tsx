import type { Metadata } from "next";
import { GITHUB_URL } from "@/lib/config";

export const metadata: Metadata = { title: "Privacidad" };

const SECTIONS: [string, React.ReactNode][] = [
  [
    "Qué datos guardamos",
    <ul key="datos" className="list-disc space-y-1 pl-5">
      <li>Si creás una cuenta: nombre, email y contraseña (guardada como hash, nunca en claro).</li>
      <li>Lo que hacés con tu cuenta: estrategias que publicás, votos, favoritas y reportes.</li>
      <li>
        Por cada sesión iniciada: dirección IP y navegador, para mantener la sesión y proteger la
        cuenta.
      </li>
      <li>
        Registros técnicos del servidor, que pueden incluir la IP, para detectar errores y abusos.
      </li>
    </ul>,
  ],
  [
    "Qué es público",
    "Tu nombre aparece junto a las estrategias que publiques. Tu email no se muestra a otros usuarios.",
  ],
  [
    "Para qué los usamos",
    "Solo para que funcionen la cuenta, las estrategias y la moderación. No vendemos ni compartimos tus datos, no mostramos publicidad y no usamos herramientas de analítica ni rastreo.",
  ],
  ["Cookies", "La web usa únicamente las cookies necesarias para mantener tu sesión iniciada."],
  [
    "El overlay de escritorio",
    "No se inyecta en el juego ni lee su memoria. Se conecta a nuestra API para bajar estrategias y, si iniciás sesión, para sincronizar tus favoritas. También consulta GitHub para saber si hay una versión nueva. Tus ajustes, la caché de estrategias y la sesión se guardan en tu PC.",
  ],
  [
    "Tus derechos",
    <p key="derechos">
      Podés eliminar tu cuenta cuando quieras desde{" "}
      <a className="underline" href="/perfil">
        tu perfil
      </a>
      : se borran tu cuenta, tus votos y tus favoritas, y las estrategias que publicaste quedan sin
      autor. Para ver o corregir tus datos, abrí una{" "}
      <a
        className="underline"
        href={`${GITHUB_URL}/issues/new/choose`}
        target="_blank"
        rel="noreferrer"
      >
        issue en GitHub
      </a>{" "}
      con tu nombre de usuario. Las issues son públicas: no escribas tu email ni otros datos
      personales ahí.
    </p>,
  ],
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="label text-xs text-red">Última actualización: noviembre de 2026</p>
        <h1 className="font-display text-5xl tracking-wide uppercase">Privacidad</h1>
        <p className="text-ink/70">
          AoE2 Overlay es un proyecto gratuito y open source. Guardamos lo mínimo para que funcione.
        </p>
      </header>

      {SECTIONS.map(([title, body]) => (
        <section key={title} className="card space-y-2 p-5 text-sm text-ink/70">
          <h2 className="label text-sm text-red">{title}</h2>
          {typeof body === "string" ? <p>{body}</p> : body}
        </section>
      ))}
    </div>
  );
}
