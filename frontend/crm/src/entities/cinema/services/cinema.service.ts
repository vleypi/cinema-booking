import { apiClient, type IPage } from "@/shared/api";
import type { ICinema, ICinemaListRequest, ICinemaPayload } from "@/entities/cinema/interfaces/cinema.interface";

const CINEMAS_PATH = "/cinemas";

class CinemaService {
  async getPage(request: ICinemaListRequest): Promise<IPage<ICinema>> {
    const { data } = await apiClient.get<IPage<ICinema>>(CINEMAS_PATH, { params: request });
    return data;
  }

  async create(payload: ICinemaPayload): Promise<ICinema> {
    const { data } = await apiClient.post<ICinema>(CINEMAS_PATH, payload);
    return data;
  }

  async update(id: string, payload: ICinemaPayload): Promise<ICinema> {
    const { data } = await apiClient.patch<ICinema>(`${CINEMAS_PATH}/${id}`, payload);
    return data;
  }
}

export const cinemaService = new CinemaService();
