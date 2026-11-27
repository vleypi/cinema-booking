import { BEAMS, DUST, HERO_IMAGES } from "@/widgets/hero/constants/hero.constant";
import type { IBeam, IMote, IPointer } from "@/widgets/hero/interfaces/beam-dust.interface";

const HALF = 0.5;
const PERCENT = 100;

export const createMote = (isAnywhere: boolean): IMote => ({
  path: isAnywhere ? Math.random() : 0,
  angleShare: (Math.random() * 2 - 1) * DUST.spread,
  speed: DUST.minSpeed + Math.random() * DUST.speedRange,
  phase: Math.random() * Math.PI * 2,
  isBig: Math.random() < DUST.bigShare,
  pushX: 0,
  pushY: 0,
});

export const measureBeam = (host: HTMLElement, image: HTMLImageElement): IBeam => {
  const hostRect = host.getBoundingClientRect();
  const imageRect = image.getBoundingClientRect();
  const naturalWidth = image.naturalWidth || 1;
  const naturalHeight = image.naturalHeight || 1;
  const scale = Math.max(imageRect.width / naturalWidth, imageRect.height / naturalHeight);
  const [positionX = HALF, positionY = HALF] = getComputedStyle(image)
    .objectPosition.split(" ")
    .map((value) => parseFloat(value) / PERCENT);
  const apex = image.currentSrc.includes(HERO_IMAGES.mobile) ? BEAMS.mobile : BEAMS.desktop;
  const apexX = imageRect.left + (imageRect.width - naturalWidth * scale) * positionX + apex.apexX * naturalWidth * scale - hostRect.left;
  const apexY = imageRect.top + (imageRect.height - naturalHeight * scale) * positionY + apex.apexY * naturalHeight * scale - hostRect.top;

  return { apexX, apexY, length: apexX + DUST.tailOffset, cell: Math.max(2, Math.round(scale)), width: hostRect.width, height: hostRect.height };
};

const pushAway = (mote: IMote, x: number, y: number, pointer: IPointer) => {
  const deltaX = x + mote.pushX - pointer.x;
  const deltaY = y + mote.pushY - pointer.y;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance >= DUST.pushRadius || distance < 0.1) return;
  const force = ((DUST.pushRadius - distance) / DUST.pushRadius) * DUST.pushForce;
  mote.pushX += (deltaX / distance) * force;
  mote.pushY += (deltaY / distance) * force;
};

export const drawDust = (context: CanvasRenderingContext2D, motes: IMote[], beam: IBeam, pointer: IPointer, time: number, isMoving: boolean) => {
  const seconds = time / 1000;
  context.clearRect(0, 0, beam.width, beam.height);

  motes.forEach((mote, index) => {
    if (isMoving) {
      mote.path += mote.speed / DUST.stepDivider;
      if (mote.path > 1) motes[index] = createMote(false);
    }
    const distance = DUST.startOffset + mote.path * beam.length;
    const angle = DUST.aim + mote.angleShare * DUST.halfAngle + Math.sin(seconds * 0.6 + mote.phase) * 0.015;
    const baseX = beam.apexX + Math.cos(angle) * distance;
    const baseY = beam.apexY + Math.sin(angle) * distance + Math.sin(seconds * 0.9 + mote.phase) * 6;
    if (pointer.isInside && isMoving) pushAway(mote, baseX, baseY, pointer);
    mote.pushX *= DUST.pushDamping;
    mote.pushY *= DUST.pushDamping;

    const life = Math.min(1, mote.path * 6) * Math.min(1, (1 - mote.path) * 3);
    const alpha = (0.25 + 0.75 * (1 - Math.abs(mote.angleShare))) * life * (mote.isBig ? 1 : 0.7);
    if (alpha < DUST.minAlpha) return;
    const size = mote.isBig ? beam.cell * 2 : beam.cell;
    context.fillStyle = `rgba(${DUST.color}, ${alpha.toFixed(3)})`;
    context.fillRect(Math.round((baseX + mote.pushX) / beam.cell) * beam.cell, Math.round((baseY + mote.pushY) / beam.cell) * beam.cell, size, size);
  });
};
