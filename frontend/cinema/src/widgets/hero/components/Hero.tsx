import { SECTION_IDS, SITE_TEXT } from "@/shared/config";
import { ButtonArrow, CONTAINER_CLASS_NAME, ScrollButton } from "@/shared/ui";
import { HERO_TEXT } from "@/widgets/hero/constants/hero.constant";
import { HeroMedia } from "@/widgets/hero/components/HeroMedia";
import { HeroTitle } from "@/widgets/hero/components/HeroTitle";

export const Hero = () => (
  <section
    id={SECTION_IDS.top}
    className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden px-gutter pt-nav pb-20 md:pb-24 max-md:justify-start max-md:pt-0 max-md:pb-10"
  >
    <HeroMedia />
    <div className={CONTAINER_CLASS_NAME}>
      <HeroTitle />
      <div className="animate-fade-rise max-w-136 delay-750">
        <p className="mb-6 max-w-lg text-[clamp(1rem,1.35vw,1.25rem)] text-paper [text-shadow:0_2px_16px_rgb(6_6_6/0.95)]">{HERO_TEXT.lead}</p>
        <ScrollButton sectionId={SECTION_IDS.schedule} className="max-sm:w-full">
          {SITE_TEXT.chooseSession}
          <ButtonArrow />
        </ScrollButton>
      </div>
    </div>
  </section>
);
