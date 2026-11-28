import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { AuditService } from '@/modules/audit/audit.service.js';
import { AuditLogDto, ListAuditLogsQueryDto } from '@/modules/audit/dto/audit-log.dto.js';
import { Auth } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';

@ApiTags('audit')
@Controller('cinemas/:cinemaId/audit-logs')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @Auth(Permission.ViewAuditLog)
  @ApiOkResponse({ type: [AuditLogDto] })
  list(@Param('cinemaId', ParseIdPipe) cinemaId: string, @Query() query: ListAuditLogsQueryDto): Promise<AuditLogDto[]> {
    return this.audit.list(cinemaId, query);
  }
}
