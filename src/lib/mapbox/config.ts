export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAP_DEFAULTS = {
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-98.5795, 39.8283] as [number, number],
  zoom: 4,
} as const;
