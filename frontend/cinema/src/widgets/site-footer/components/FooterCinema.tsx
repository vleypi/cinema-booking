"use client";

import { joinClassNames } from "@luch/shared/lib";
import { MONO_LABEL_CLASS_NAME } from "@/shared/ui";
import { CINEMA_TEXT, useCurrentCinema } from "@/entities/cinema";
import { SITE_FOOTER_TEXT } from "@/widgets/site-footer/constants/site-footer.constant";

export const FooterCinema = () => {
  const { cinema } = useCurrentCinema();

  if (!cinema) return null;

  return (
    <>
      <div>
        <p className={joinClassNames(MONO_LABEL_CLASS_NAME, "mb-2.5")}>{SITE_FOOTER_TEXT.address}</p>
        <p>{cinema.name}</p>
        <p>{cinema.address}</p>
      </div>
      <div>
        <p className={joinClassNames(MONO_LABEL_CLASS_NAME, "mb-2.5")}>{SITE_FOOTER_TEXT.hours}</p>
        <p>{CINEMA_TEXT.hours(cinema.opensAt, cinema.closesAt)}</p>
      </div>
    </>
  );
};
