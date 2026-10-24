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
