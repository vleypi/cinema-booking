"use client";

import { useEffect, useRef, useState } from "react";
import { IN_VIEW_ROOT_MARGIN } from "@/shared/config";

export const useInView = <TElement extends Element>() => {
  const ref = useRef<TElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: IN_VIEW_ROOT_MARGIN },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};
