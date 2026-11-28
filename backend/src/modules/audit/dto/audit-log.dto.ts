import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListAuditLogsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  staffUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class AuditLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  staffUserId: string;

  @ApiProperty()
  staffFullName: string;

  @ApiProperty({ type: String, nullable: true })
  cinemaId: string | null;

  @ApiProperty()
  action: string;

  @ApiProperty()
  entityType: string;

  @ApiProperty()
  entityId: string;

  @ApiProperty({ type: Object, nullable: true })
  before: Record<string, unknown> | null;

  @ApiProperty({ type: Object, nullable: true })
  after: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;
}
