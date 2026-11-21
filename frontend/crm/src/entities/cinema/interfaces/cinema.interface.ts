import type { IListRequest } from "@/shared/api";
import type { BooleanFilterValue } from "@/shared/config";
import type { CinemaSortField } from "@/entities/cinema/constants/cinema.constant";

export interface ICinema {
  id: string;
  name: string;
  slug: string;
  address: string;
  timezone: string;
  opensAt: string;
  closesAt: string;
  cleaningBreakMinutes: number;
  isPublished: boolean;
}

export type ICinemaPayload = Omit<ICinema, "id">;

export interface ICinemaListRequest extends IListRequest<CinemaSortField> {
  isPublished?: BooleanFilterValue;
}
