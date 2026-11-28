export const HERO_IMAGES = {
  desktop: "/images/hero-dither.png",
  mobile: "/images/hero-dither-m.png",
  mobileMedia: "(max-width: 47.99rem)",
  width: 340,
  height: 227,
  mobileWidth: 170,
  mobileHeight: 125,
} as const;

export const HERO_TEXT = {
  title: "Кино начинается с луча",
  titleLines: ["Кино", "начинается", "с луча"],
  lead: "Сеть кинотеатров «Луч» — лазерная проекция 4K, объёмный звук и уютные залы с комфортными креслами и диванами на двоих.",
} as const;

export const TITLE_LINE_DELAY_CLASSES = ["delay-250", "delay-360", "delay-470"] as const;

export const BEAMS = {
  desktop: { apexX: 0.475, apexY: 0.5 },
  mobile: { apexX: 0.572, apexY: 0.452 },
} as const;

export const DUST = {
  count: 130,
  coarseCount: 70,
  aim: Math.PI + 0.05,
  halfAngle: 0.3,
  spread: 0.92,
  bigShare: 0.12,
  minSpeed: 0.012,
  speedRange: 0.03,
  startOffset: 30,
  tailOffset: 40,
  pushRadius: 130,
  pushForce: 9,
  pushDamping: 0.94,
  maxPixelRatio: 1.5,
  frameIntervalMs: 33,
  stepDivider: 30,
  minAlpha: 0.03,
  color: "248, 242, 230",
} as const;
