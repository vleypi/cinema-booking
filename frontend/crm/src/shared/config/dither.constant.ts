export const DITHER_GRID = {
  columns: 40,
  rows: 20,
  cellSize: 8,
} as const;

export const BAYER_MATRIX_SIZE = 4;

export const BAYER_MATRIX = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const;

export const DITHER_FIELD = {
  waveFrequencyX: 0.22,
  waveFrequencyY: 0.3,
  wavePhaseX: 1.7,
  waveWeight: 0.45,
  glowWeight: 0.75,
  glowFocusStart: 0.3,
  glowFocusStep: 0.37,
  glowFocusRange: 0.5,
  glowFocusY: 0.6,
  glowStretchY: 0.6,
  glowFalloff: 1.8,
  highlightOffset: 0.45,
} as const;

export const DITHER_AVATAR = {
  seed: 2,
  viewBox: "113 30 120 120",
  baseOpacity: 0.55,
} as const;
