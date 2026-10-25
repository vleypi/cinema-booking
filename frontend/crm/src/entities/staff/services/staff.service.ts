import { apiClient, type IListRequest, type IPage } from "@/shared/api";
import type { StaffSortField } from "@/entities/staff/constants/staff.constant";
import type { ICreateStaffPayload, IStaffMember, IUpdateStaffPayload } from "@/entities/staff/interfaces/staff.interface";

const STAFF_PATH = "/staff";

class StaffService {
  async getPageByCinema(cinemaId: string, request: IListRequest<StaffSortField>): Promise<IPage<IStaffMember>> {
    const { data } = await apiClient.get<IPage<IStaffMember>>(`/cinemas/${cinemaId}${STAFF_PATH}`, { params: request });
    return data;
  }

  async create(payload: ICreateStaffPayload): Promise<IStaffMember> {
    const { data } = await apiClient.post<IStaffMember>(STAFF_PATH, payload);
    return data;
  }

  async update(id: string, payload: IUpdateStaffPayload): Promise<IStaffMember> {
    const { data } = await apiClient.patch<IStaffMember>(`${STAFF_PATH}/${id}`, payload);
    return data;
  }
}

export const staffService = new StaffService();
