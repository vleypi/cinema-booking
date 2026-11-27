"use client";

import { joinClassNames } from "@luch/shared/lib";
import { Fragment } from "react";
import { getWordDelayClassName, splitWords, useInView } from "@/shared/lib";

interface IMaskedHeadingProps {
  text: string;
  id?: string;
  className?: string;
}

export const MaskedHeading = ({ text, id, className }: IMaskedHeadingProps) => {
  const { ref, isVisible } = useInView<HTMLHeadingElement>();
  const words = splitWords(text);

  return (
    <h2 ref={ref} id={id} aria-label={text} data-visible={isVisible || undefined} className={joinClassNames("group", className)}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span aria-hidden className="-mt-[0.14em] -mb-[0.04em] inline-block overflow-hidden pt-[0.14em] pb-[0.04em] align-top">
            <span
              className={joinClassNames(
                "inline-block translate-y-[110%] transition-transform duration-850 ease-out-expo group-data-visible:translate-y-0 motion-reduce:translate-y-0",
                getWordDelayClassName(index),
              )}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 && " "}
        </Fragment>
      ))}
    </h2>
  );
};
