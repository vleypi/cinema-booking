"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ROUTES } from "@/shared/config";
import { Button } from "@/shared/ui/Button";
import type { ButtonSize, ButtonVariant } from "@/shared/ui/ui.constant";

interface IScrollButtonProps {
  sectionId: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

export const ScrollButton = ({ sectionId, variant, size, className, children }: IScrollButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.push(ROUTES.home);
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick}>
      {children}
    </Button>
  );
};
