export interface ITimeBandInput {
  name: string;
  startsAt: string;
  multiplier: number;
}

export interface ITimeBand extends ITimeBandInput {
  id: string;
  cinemaId: string;
  endsAt: string;
}
