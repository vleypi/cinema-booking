"use client";

import type { ReactNode } from "react";
import type { ICinemaSummary } from "@/shared/api";
import { EmptyState } from "@/shared/ui";
import { VIEWER_TEXT } from "@/entities/viewer/constants/viewer.constant";
import { useCurrentCinema } from "@/entities/viewer/hooks/useCurrentCinema";

interface IRequireCurrentCinemaProps {
  children: (cinema: ICinemaSummary) => ReactNode;
}

export const RequireCurrentCinema = ({ children }: IRequireCurrentCinemaProps) => {
  const { cinema } = useCurrentCinema();

  if (!cinema) return <EmptyState icon="building" title={VIEWER_TEXT.noCinemaTitle} description={VIEWER_TEXT.noCinemaDescription} />;

  return children(cinema);
};
