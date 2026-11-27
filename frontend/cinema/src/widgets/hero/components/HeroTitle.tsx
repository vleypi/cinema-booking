import { joinClassNames } from "@luch/shared/lib";
import { HERO_TEXT, TITLE_LINE_DELAY_CLASSES } from "@/widgets/hero/constants/hero.constant";

export const HeroTitle = () => (
  <h1
    aria-label={HERO_TEXT.title}
    className="relative z-1 mb-6 font-display text-hero leading-[0.86] font-medium tracking-[-0.012em] uppercase mix-blend-difference md:mb-8 max-md:-mt-[18svh] max-md:mb-7 max-md:text-[clamp(3.2rem,15vw,6rem)]"
  >
    {HERO_TEXT.titleLines.map((line, index) => (
      <span key={line} aria-hidden className="block overflow-hidden pb-[0.02em]">
        <span className={joinClassNames("inline-block animate-line-rise", TITLE_LINE_DELAY_CLASSES[index])}>{line}</span>
      </span>
    ))}
  </h1>
);
