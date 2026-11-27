import { joinClassNames } from "@luch/shared/lib";
import { SECTION_IDS, SITE_CONTACTS } from "@/shared/config";
import { CONTAINER_CLASS_NAME, MaskedHeading, Reveal, SECTION_NOTE_CLASS_NAME, SECTION_TITLE_CLASS_NAME } from "@/shared/ui";
import { FAQ_ITEMS, FAQ_TEXT } from "@/widgets/faq/constants/faq.constant";

const TITLE_ID = `${SECTION_IDS.faq}-title`;

export const Faq = () => (
  <section id={SECTION_IDS.faq} aria-labelledby={TITLE_ID} className="scroll-mt-nav border-t border-paper/13 px-gutter py-[clamp(5rem,11vw,10rem)]">
    <div className={joinClassNames(CONTAINER_CLASS_NAME, "grid items-start gap-x-[clamp(2rem,6vw,6rem)] gap-y-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]")}>
      <div className="grid gap-6 lg:sticky lg:top-[calc(var(--spacing-nav)+2rem)]">
        <MaskedHeading id={TITLE_ID} text={FAQ_TEXT.title} className={SECTION_TITLE_CLASS_NAME} />
        <p className={SECTION_NOTE_CLASS_NAME}>
          {FAQ_TEXT.note} <a href={SITE_CONTACTS.phoneHref} className="whitespace-nowrap text-paper">{SITE_CONTACTS.phone}</a>
        </p>
      </div>
      <div className="border-t border-paper/13">
        {FAQ_ITEMS.map(({ question, answer }, index) => (
          <Reveal key={question} order={index}>
            <details className="group border-b border-paper/13">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[clamp(1.1rem,1.8vw,1.45rem)] font-medium [&::-webkit-details-marker]:hidden">
                {question}
                <span
                  aria-hidden
                  className="relative size-3.5 flex-none transition-transform duration-450 ease-out-expo group-open:rotate-45 before:absolute before:inset-x-0 before:top-1/2 before:h-[1.5px] before:-translate-y-1/2 before:bg-paper after:absolute after:inset-y-0 after:left-1/2 after:w-[1.5px] after:-translate-x-1/2 after:bg-paper"
                />
              </summary>
              <p className="max-w-176 pb-6.5 text-paper/64">{answer}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
