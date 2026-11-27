import { MEDIA_PATH } from "./film.constant";

export const getPosterUrl = (posterFileId: string | null): string | null => (posterFileId ? `${MEDIA_PATH}/${posterFileId}` : null);
