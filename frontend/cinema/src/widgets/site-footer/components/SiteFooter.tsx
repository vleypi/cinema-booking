import { joinClassNames } from "@luch/shared/lib";
import { SITE_CONTACTS, SITE_TEXT } from "@/shared/config";
import { CONTAINER_CLASS_NAME, MONO_LABEL_CLASS_NAME } from "@/shared/ui";
import { FooterCinema } from "@/widgets/site-footer/components/FooterCinema";
import { SITE_FOOTER_TEXT } from "@/widgets/site-footer/constants/site-footer.constant";

const LINK_CLASS_NAME = "inline-flex min-h-11 items-center hover:underline hover:underline-offset-3";

export const SiteFooter = () => (
  <footer className="relative overflow-hidden bg-linear-to-b from-transparent via-ink to-ink px-gutter pt-12 pb-8">
    <div className={CONTAINER_CLASS_NAME}>
      <p
        aria-hidden
        className="mb-12 text-center font-display text-[clamp(8rem,38vw,40rem)] leading-[0.75] font-semibold tracking-[-0.02em] text-ink-3 uppercase [mask-image:linear-gradient(to_bottom,black_30%,transparent_95%)]"
      >
        {SITE_TEXT.brand}
      </p>
      <div className="grid justify-items-center gap-8 text-center lg:grid-cols-3">
        <FooterCinema />
        <div>
          <p className={joinClassNames(MONO_LABEL_CLASS_NAME, "mb-2.5")}>{SITE_FOOTER_TEXT.contacts}</p>
          <p>
            <a href={SITE_CONTACTS.phoneHref} className={LINK_CLASS_NAME}>
              {SITE_CONTACTS.phone}
            </a>
          </p>
          <p>
            <a href={SITE_CONTACTS.emailHref} className={LINK_CLASS_NAME}>
              {SITE_CONTACTS.email}
            </a>
          </p>
        </div>
      </div>
      <p className="mt-10 text-center text-[0.82rem] text-paper/38">{SITE_FOOTER_TEXT.legal(new Date().getFullYear())}</p>
    </div>
  </footer>
);
