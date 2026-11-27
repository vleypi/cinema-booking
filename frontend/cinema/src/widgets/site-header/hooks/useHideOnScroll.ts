"use client";

import { useEffect, useState } from "react";

const HIDE_AFTER_VIEWPORT_SHARE = 0.6;

export const useHideOnScroll = (isLocked: boolean): boolean => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastScroll = scrollY;
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const isScrollingDown = scrollY > lastScroll;
        setIsHidden(!isLocked && isScrollingDown && scrollY > innerHeight * HIDE_AFTER_VIEWPORT_SHARE);
        lastScroll = scrollY;
      });
    };

    addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
    };
  }, [isLocked]);

  return isHidden;
};
