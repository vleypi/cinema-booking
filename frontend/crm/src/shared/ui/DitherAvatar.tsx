import { joinClassNames } from "@luch/shared/lib";
import { DITHER_AVATAR } from "@/shared/config";
import { buildDitherLayers } from "@/shared/lib";

type DitherAvatarSize = "sm" | "md";

interface IDitherAvatarProps {
  size?: DitherAvatarSize;
}

const SIZE_CLASSES: Record<DitherAvatarSize, string> = {
  sm: "size-8",
  md: "size-9",
};

const AVATAR_LAYERS = buildDitherLayers(DITHER_AVATAR.seed);

export const DitherAvatar = ({ size = "md" }: IDitherAvatarProps) => (
  <span className={joinClassNames("block shrink-0 overflow-hidden rounded-full bg-brand", SIZE_CLASSES[size])}>
    <svg viewBox={DITHER_AVATAR.viewBox} preserveAspectRatio="xMidYMid slice" className="size-full" aria-hidden="true">
      <path d={AVATAR_LAYERS.base} fillOpacity={DITHER_AVATAR.baseOpacity} className="fill-sage" />
      <path d={AVATAR_LAYERS.highlight} className="fill-sand" />
    </svg>
  </span>
);
