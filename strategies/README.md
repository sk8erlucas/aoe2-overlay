# Estrategias

Estrategias base (build orders) que vienen con el overlay y se cargan en la base de datos como "verificadas". Se pueden aportar por PR.

## Formato

Es **compatible con el formato de la comunidad** (Build Order Guide / RTS Overlay): un JSON de ese formato se puede importar tal cual. Además sumamos campos opcionales propios para las sugerencias.

El esquema completo, con validaciones, está en [`packages/shared/src/schema.ts`](../packages/shared/src/schema.ts).

```jsonc
{
  "name": "Fast Castle Boom", // obligatorio
  "civilization": "Generic", // obligatorio: civ en inglés ("Malay"), lista (["Malay", "Khmer"]) o "Generic"/"Any"
  "author": "tu-nombre", // obligatorio
  "source": "https://...", // opcional: video o guía original
  "description": "...", // opcional

  // --- Extensiones propias (opcionales, mejoran las sugerencias) ---
  "maps": ["arena", "black_forest"], // ids de packages/game-data/src/maps.ts
  "map_types": ["closed"], // open | closed | hybrid | water
  "vs_civilizations": ["Britons"], // civs rivales contra las que es buena
  "positions": ["1v1", "pocket"], // 1v1 | flank | pocket
  "difficulty": "beginner", // beginner | intermediate | advanced
  "tags": ["boom"],

  "build_order": [
    {
      "villager_count": 6, // aldeanos totales en este paso
      "age": 1, // 1 Alta Edad Media, 2 Feudal, 3 Castillos, 4 Imperial
      "time": "1:15", // opcional: tiempo de juego (m:ss o segundos). Si falta, se estima
      "resources": {
        "wood": 0,
        "food": 6,
        "gold": 0,
        "stone": 0,
        "builder": 0, // opcional: aldeanos construyendo
      },
      "notes": ["6 aldeanos a las ovejas"], // uno o más textos
    },
  ],
}
```

### Cómo se calcula el tiempo de cada paso

Los pasos se indexan por **cantidad de aldeanos**. Si un paso no trae `time`, el overlay lo estima así:

- Un aldeano cada **25 s de juego** a partir de los 3 iniciales.
- Más el tiempo de cada avance de edad: Feudal 130 s, Castillos 160 s, Imperial 190 s.

El reloj del overlay corre en tiempo de juego según la velocidad de la partida (1.7 por defecto). Siempre se puede avanzar o retroceder de paso a mano con las hotkeys.

### Íconos en las notas

Las notas aceptan la sintaxis de la comunidad `@categoria/archivo.png@`, por ejemplo `"Create 6 @resource/MaleVillDE.jpg@ on @animal/Sheep_aoe2DE.png@"`. Mientras no haya un set de íconos propio, el overlay los muestra como texto ("aldeano", "ovejas"). Ver [`packages/shared/src/notes.ts`](../packages/shared/src/notes.ts).

En las estrategias de esta carpeta preferimos **texto en español sin íconos**.

## Reglas para aportar

- Nombre de archivo en kebab-case: `fast-castle-boom.json`.
- La suma de `resources` (incluido `builder`) tendría que coincidir con `villager_count`. El validador avisa si no.
- Escribí los pasos con tus palabras. Si te basás en una guía o video, poné el link en `source` y respetá la licencia del original.
- Antes del PR, corré:

```bash
pnpm validate:strategies
```
