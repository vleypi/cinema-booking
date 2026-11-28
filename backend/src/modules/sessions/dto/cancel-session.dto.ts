import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';

export class CancelSessionDto {
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  reason: string;
}

export class CancelSessionPreviewDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty()
  activeTicketsCount: number;

  @ApiProperty()
  refundAmount: number;

  @ApiProperty()
  affectedOrdersCount: number;
}

export class CancelSessionResultDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty()
  cancelReason: string;

  @ApiProperty()
  refundedOrdersCount: number;

  @ApiProperty()
  refundedTicketsCount: number;

  @ApiProperty()
  refundedAmount: number;
}
