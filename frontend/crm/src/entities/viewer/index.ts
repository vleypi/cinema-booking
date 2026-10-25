export { CurrentCinemaProvider } from "@/entities/viewer/components/CurrentCinemaProvider";
export { RequireCurrentCinema } from "@/entities/viewer/components/RequireCurrentCinema";
export { RequirePermission } from "@/entities/viewer/components/RequirePermission";
export { ViewerAvatar } from "@/entities/viewer/components/ViewerAvatar";
export { useCurrentCinema } from "@/entities/viewer/hooks/useCurrentCinema";
export { useViewer } from "@/entities/viewer/hooks/useViewer";
export type { IViewer } from "@/entities/viewer/interfaces/viewer.interface";
export { canManageRole, getAssignableRoles, getAvailableNavItems, hasPermission } from "@/entities/viewer/utils/viewer-access.util";
