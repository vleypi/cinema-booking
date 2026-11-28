export interface ICinema {
  id: string;
  name: string;
  slug: string;
  address: string;
  timezone: string;
  opensAt: string;
  closesAt: string;
}

export interface ICurrentCinemaState {
  cinema: ICinema | null;
  cinemas: readonly ICinema[];
  isLoading: boolean;
  select: (cinemaId: string) => void;
}
