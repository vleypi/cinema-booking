"use client";

import { useRef } from "react";
import { HERO_IMAGES } from "@/widgets/hero/constants/hero.constant";
import { useBeamDust } from "@/widgets/hero/hooks/useBeamDust";

export const HeroMedia = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useBeamDust(canvasRef, imageRef);

  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-1 animate-fade-in overflow-hidden bg-ink after:pointer-events-none after:absolute after:inset-0 after:bg-linear-to-t after:from-ink/96 after:via-ink/78 after:via-32% after:to-transparent after:to-62% max-md:relative max-md:inset-auto max-md:z-0 max-md:-mx-gutter max-md:h-[56svh]"
    >
      <picture>
        <source media={HERO_IMAGES.mobileMedia} srcSet={HERO_IMAGES.mobile} width={HERO_IMAGES.mobileWidth} height={HERO_IMAGES.mobileHeight} />
        <img
          ref={imageRef}
          src={HERO_IMAGES.desktop}
          width={HERO_IMAGES.width}
          height={HERO_IMAGES.height}
          alt=""
          fetchPriority="high"
          className="absolute top-0 left-0 h-full w-[125%] max-w-none animate-flicker object-cover object-[0%_40%] [image-rendering:pixelated] max-md:w-full max-md:object-[62%_50%]"
        />
      </picture>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
};
