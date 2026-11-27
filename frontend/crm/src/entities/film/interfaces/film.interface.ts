import type { FilmStatus } from "@luch/shared/film";
import type { IListRequest } from "@/shared/api";
import type { BooleanFilterValue } from "@/shared/config";
import type { FilmSortField } from "@/entities/film/constants/film.constant";

export interface IFilmListRequest extends IListRequest<FilmSortField> {
  status?: readonly FilmStatus[];
  isPremiere?: BooleanFilterValue;
}
