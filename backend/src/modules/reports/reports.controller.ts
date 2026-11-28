import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { Auth } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import { OccupancySessionItemDto, ReportPeriodQueryDto, RevenueReportDto } from '@/modules/reports/dto/report.dto.js';
import { ReportsService } from '@/modules/reports/reports.service.js';

@ApiTags('reports')
@Controller('cinemas/:cinemaId/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('revenue')
  @Auth(Permission.ViewReports)
  @ApiOkResponse({ type: RevenueReportDto })
  getRevenue(@Param('cinemaId', ParseIdPipe) cinemaId: string, @Query() query: ReportPeriodQueryDto): Promise<RevenueReportDto> {
    return this.reports.getRevenueReport(cinemaId, query);
  }

  @Get('occupancy')
  @Auth(Permission.ViewReports)
  @ApiOkResponse({ type: [OccupancySessionItemDto] })
  getOccupancy(@Param('cinemaId', ParseIdPipe) cinemaId: string, @Query() query: ReportPeriodQueryDto): Promise<OccupancySessionItemDto[]> {
    return this.reports.getOccupancyReport(cinemaId, query);
  }
}
