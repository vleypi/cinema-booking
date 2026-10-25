import { joinClassNames } from "@luch/shared/lib";
import type { IViewer } from "@/entities/viewer/interfaces/viewer.interface";
import { getInitials } from "@/entities/viewer/utils/viewer-name.util";

type ViewerAvatarSize = "sm" | "md";

interface IViewerAvatarProps {
  viewer: Pick<IViewer, "fullName">;
  size?: ViewerAvatarSize;
}

const SIZE_CLASSES: Record<ViewerAvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-9 text-sm",
};

export const ViewerAvatar = ({ viewer, size = "md" }: IViewerAvatarProps) => (
  <span
    className={joinClassNames(
      "grid shrink-0 place-items-center rounded-full bg-brand-soft font-semibold text-brand",
      SIZE_CLASSES[size],
    )}
  >
    {getInitials(viewer.fullName)}
  </span>
);
