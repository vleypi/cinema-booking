import { HTTP_STATUS, toApiError } from "@luch/shared/api";
import { apiClient } from "@/shared/api";
import type { IHall, IHallLayout, IHallLayoutPayload, IHallPayload, IPriceZone, IPriceZonePayload } from "@/entities/hall/interfaces/hall.interface";

const HALLS_PATH = "/halls";
const PRICE_ZONES_PATH = "/price-zones";

class HallService {
  async getByCinema(cinemaId: string): Promise<IHall[]> {
    const { data } = await apiClient.get<IHall[]>(`/cinemas/${cinemaId}/halls`);
    return data;
  }

  async create(cinemaId: string, payload: IHallPayload): Promise<IHall> {
    const { data } = await apiClient.post<IHall>(`/cinemas/${cinemaId}/halls`, payload);
    return data;
  }

  async update(hallId: string, payload: IHallPayload): Promise<IHall> {
    const { data } = await apiClient.patch<IHall>(`${HALLS_PATH}/${hallId}`, payload);
    return data;
  }

  async createPriceZone(hallId: string, payload: IPriceZonePayload): Promise<IPriceZone> {
    const { data } = await apiClient.post<IPriceZone>(`${HALLS_PATH}/${hallId}/price-zones`, payload);
    return data;
  }

  async updatePriceZone(priceZoneId: string, payload: IPriceZonePayload): Promise<IPriceZone> {
    const { data } = await apiClient.patch<IPriceZone>(`${PRICE_ZONES_PATH}/${priceZoneId}`, payload);
    return data;
  }

  async removePriceZone(priceZoneId: string): Promise<void> {
    await apiClient.delete(`${PRICE_ZONES_PATH}/${priceZoneId}`);
  }

  async getCurrentLayout(hallId: string): Promise<IHallLayout | null> {
    try {
      const { data } = await apiClient.get<IHallLayout>(`${HALLS_PATH}/${hallId}/layout`);
      return data;
    } catch (error) {
      if (toApiError(error).status === HTTP_STATUS.notFound) return null;
      throw error;
    }
  }

  async createLayout(hallId: string, payload: IHallLayoutPayload): Promise<IHallLayout> {
    const { data } = await apiClient.post<IHallLayout>(`${HALLS_PATH}/${hallId}/layouts`, payload);
    return data;
  }
}

export const hallService = new HallService();
