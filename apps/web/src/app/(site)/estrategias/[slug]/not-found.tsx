import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="font-display text-5xl text-red">NO ENCONTRADA</h1>
      <p className="mt-3 text-ink/70">Esta estrategia no existe o fue ocultada.</p>
      <Link className="btn btn-red mt-6" href="/estrategias">
        Ver estrategias
      </Link>
    </div>
  );
}
