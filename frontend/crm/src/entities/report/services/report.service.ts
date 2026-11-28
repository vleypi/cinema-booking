import { apiClient } from "@/shared/api";
import type {
  IOccupancySessionItem,
  IReportPeriod,
  IRevenueReport,
} from "@/entities/report/interfaces/report.interface";

const reportsBasePath = (cinemaId: string) => `/cinemas/${cinemaId}/reports`;

class ReportService {
  async getRevenue(cinemaId: string, period: IReportPeriod): Promise<IRevenueReport> {
    const { data } = await apiClient.get<IRevenueReport>(`${reportsBasePath(cinemaId)}/revenue`, {
      params: {
        ...(period.from && { from: period.from }),
        ...(period.to && { to: period.to }),
      },
    });
    return data;
  }

  async getOccupancy(cinemaId: string, period: IReportPeriod): Promise<IOccupancySessionItem[]> {
    const { data } = await apiClient.get<IOccupancySessionItem[]>(`${reportsBasePath(cinemaId)}/occupancy`, {
      params: {
        ...(period.from && { from: period.from }),
        ...(period.to && { to: period.to }),
      },
    });
    return data;
  }
}

export const reportService = new ReportService();
