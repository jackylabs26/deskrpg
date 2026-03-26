// src/lib/map-thumbnail.ts — Generate a small canvas thumbnail from map data

/** Tile colors for thumbnail rendering */
const TILE_COLORS: Record<number, string> = {
  0: "#1a1a2e", // empty
  1: "#8b8378", // floor
  2: "#4a4a5e", // wall
  7: "#8b7a5a", // door
  12: "#6b6560", // carpet
};

/** Object colors for thumbnail */
const OBJECT_COLORS: Record<string, string> = {
  desk: "#6b4226",
  chair: "#4060b0",
  computer: "#222233",
  plant: "#2d8b2d",
  meeting_table: "#4a3020",
  coffee: "#5a4a3a",
  water_cooler: "#88bbff",
  bookshelf: "#5a3a1a",
  whiteboard: "#f0f0f0",
  reception_desk: "#8b6b3a",
  cubicle_wall: "#888899",
};

/**
 * Generate a thumbnail data URL from map layers and objects.
 * @param layers - floor and walls 2D arrays
 * @param objects - array of MapObject
 * @param cols - map width
 * @param rows - map height
 * @param scale - pixels per tile (default 4)
 * @returns data URL string (image/png)
 */
export function generateMapThumbnail(
  layers: { floor: number[][]; walls: number[][] },
  objects: { type: string; col: number; row: number }[],
  cols: number,
  rows: number,
  scale = 4,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = cols * scale;
  canvas.height = rows * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Draw floor
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tileId = layers.floor[r]?.[c] ?? 0;
      ctx.fillStyle = TILE_COLORS[tileId] || TILE_COLORS[0];
      ctx.fillRect(c * scale, r * scale, scale, scale);
    }
  }

  // Draw walls on top
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tileId = layers.walls[r]?.[c] ?? 0;
      if (tileId === 0) continue;
      ctx.fillStyle = TILE_COLORS[tileId] || "#4a4a5e";
      ctx.fillRect(c * scale, r * scale, scale, scale);
    }
  }

  // Draw objects
  for (const obj of objects) {
    const color = OBJECT_COLORS[obj.type];
    if (!color) continue;
    ctx.fillStyle = color;
    ctx.fillRect(obj.col * scale + 1, obj.row * scale + 1, scale - 2, scale - 2);
  }

  return canvas.toDataURL("image/png");
}
