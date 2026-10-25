import { apiClient } from "@/shared/api";
import type { ITimeBand, ITimeBandInput } from "@/entities/time-band/interfaces/time-band.interface";

const timeBandsPath = (cinemaId: string) => `/cinemas/${cinemaId}/time-bands`;

class TimeBandService {
  async getByCinema(cinemaId: string): Promise<ITimeBand[]> {
    const { data } = await apiClient.get<ITimeBand[]>(timeBandsPath(cinemaId));
    return data;
  }

  async replace(cinemaId: string, bands: ITimeBandInput[]): Promise<ITimeBand[]> {
    const { data } = await apiClient.put<ITimeBand[]>(timeBandsPath(cinemaId), { bands });
    return data;
  }
}

export const timeBandService = new TimeBandService();
