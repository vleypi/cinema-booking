import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CheckInTicketDto {
  @ApiPropertyOptional({ description: 'Подписанная строка из QR-кода билета' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(200)
  qrPayload?: string;

  @ApiPropertyOptional({ description: 'Десятисимвольный код билета без учета регистра' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @MaxLength(32)
  code?: string;

  @ApiPropertyOptional({ description: 'Идентификатор зала на входе (FR-T03)' })
  @IsOptional()
  @IsNumberString()
  hallId?: string;
}
