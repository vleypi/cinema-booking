import { apiClient } from "@/shared/api";
import type { ICreateStaffPayload, IStaffMember, IUpdateStaffPayload } from "@/entities/staff/interfaces/staff.interface";

const STAFF_PATH = "/staff";

class StaffService {
  async getByCinema(cinemaId: string): Promise<IStaffMember[]> {
    const { data } = await apiClient.get<IStaffMember[]>(`/cinemas/${cinemaId}${STAFF_PATH}`);
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
