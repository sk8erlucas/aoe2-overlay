import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Páginas privadas o de formularios: no aportan nada en un buscador.
      disallow: [
        "/perfil",
        "/moderacion",
        "/dispositivo",
        "/ingresar",
        "/registro",
        "/estrategias/nueva",
        "/estrategias/*/editar",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
