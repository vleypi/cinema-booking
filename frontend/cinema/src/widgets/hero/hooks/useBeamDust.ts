"use client";

import { type RefObject, useEffect } from "react";
import { MEDIA_QUERIES } from "@/shared/config";
import { DUST } from "@/widgets/hero/constants/hero.constant";
import type { IBeam, IPointer } from "@/widgets/hero/interfaces/beam-dust.interface";
import { createMote, drawDust, measureBeam } from "@/widgets/hero/utils/beam-dust.util";

export const useBeamDust = (canvasRef: RefObject<HTMLCanvasElement | null>, imageRef: RefObject<HTMLImageElement | null>) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !image || !host || !context) return;

    const isMoving = !matchMedia(MEDIA_QUERIES.reducedMotion).matches;
    const isCoarse = matchMedia(MEDIA_QUERIES.coarsePointer).matches;
    const motes = Array.from({ length: isCoarse ? DUST.coarseCount : DUST.count }, () => createMote(true));
    const pointer: IPointer = { x: 0, y: 0, isInside: false };
    let beam: IBeam | null = null;
    let frame = 0;
    let lastDraw = 0;

    const draw = (time: number) => beam && drawDust(context, motes, beam, pointer, time, isMoving);
    const measure = () => {
      beam = measureBeam(host, image);
      const pixelRatio = Math.min(devicePixelRatio || 1, DUST.maxPixelRatio);
      canvas.width = Math.round(beam.width * pixelRatio);
      canvas.height = Math.round(beam.height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw(performance.now());
    };
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (time - lastDraw < DUST.frameIntervalMs) return;
      lastDraw = time;
      draw(time);
    };
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting && isMoving) frame = requestAnimationFrame(loop);
    });
    const follow = ({ clientX, clientY }: PointerEvent) => {
      const { left, top } = host.getBoundingClientRect();
      Object.assign(pointer, { x: clientX - left, y: clientY - top, isInside: true });
    };
    const leave = () => {
      pointer.isInside = false;
    };
    const start = () => {
      measure();
      observer.observe(host);
    };

    if (image.complete && image.naturalWidth) start();
    else image.addEventListener("load", start, { once: true });
    addEventListener("resize", measure);
    if (!isCoarse) {
      host.addEventListener("pointermove", follow);
      host.addEventListener("pointerleave", leave);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      image.removeEventListener("load", start);
      removeEventListener("resize", measure);
      host.removeEventListener("pointermove", follow);
      host.removeEventListener("pointerleave", leave);
    };
  }, [canvasRef, imageRef]);
};
